from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from playwright.sync_api import sync_playwright
import time
import random
import urllib.parse
import re
import threading
import uuid
import sys

if sys.platform == 'win32':
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    keyword: str
    location: str

# Global dictionary to store background jobs state
jobs = {}

def extract_deep_data(page, url):
    try:
        page.goto(url, wait_until="domcontentloaded")
        try:
            page.wait_for_selector('h1', timeout=8000)
        except:
            return None
            
        time.sleep(random.uniform(1, 2))
        
        # Name
        businessName = None
        try:
            businessName = page.locator('h1').inner_text()
        except:
            pass

        # Rating
        rating = None
        try:
            rating_text = page.locator('div[role="button"][aria-label*="stars"]').first.inner_text()
            rating_match = re.search(r"(\d+(\.\d+)?)", rating_text)
            if rating_match:
                rating = float(rating_match.group(1))
        except:
            pass

        # Address 
        address = "Address not found"
        try:
            address_btn = page.locator('button[data-tooltip*="address"], button[aria-label*="Address"]').first
            if address_btn.count() > 0:
                address = address_btn.get_attribute("aria-label").replace("Address: ", "").strip()
        except:
            pass
            
        # Website
        website = None
        try:
            web_btn = page.locator('a[data-tooltip*="website"], a[aria-label*="Website"]').first
            if web_btn.count() > 0:
                website = web_btn.get_attribute("href")
        except:
            pass

        # Phone
        phone = None
        try:
            phone_btn = page.locator('button[data-tooltip*="phone number"], button[aria-label*="Phone"]').first
            if phone_btn.count() > 0:
                phone = phone_btn.get_attribute("aria-label").replace("Phone: ", "").strip()
        except:
            pass

        return {
            "googlePlaceId": f"scraped_{uuid.uuid4().hex[:8]}",
            "businessName": businessName,
            "address": address,
            "phoneNumber": phone,
            "website": website,
            "googleMapsLink": url,
            "rating": rating
        }
    except Exception as e:
        print(f"Deep extract failed for {url}: {e}")
        return None

def _scrape_job(job_id, keyword, location):
    query = f"{keyword} in {location}"
    encoded_query = urllib.parse.quote_plus(query)
    url = f"https://www.google.com/maps/search/{encoded_query}"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        try:
            page.goto(url, wait_until="domcontentloaded")
            time.sleep(random.uniform(2, 4))
            
            feed_selector = 'div[role="feed"]'
            try:
                page.wait_for_selector(feed_selector, timeout=10000)
            except Exception as wait_e:
                jobs[job_id]["error"] = "Could not load results feed. The keyword might be too vague."
                jobs[job_id]["status"] = "error"
                browser.close()
                return

            collected_urls = set()
            
            # Phase 1: Scroll and accumulate URLs
            scroll_attempts = 15 # Scroll 15 times to get roughly 50-100 urls
            for i in range(scroll_attempts):
                if jobs[job_id]["_stop_flag"]:
                    break
                
                # Grab all URLs currently in DOM
                links = page.locator('div[role="feed"] > div > div[role="article"] a')
                for i in range(links.count()):
                    href = links.nth(i).get_attribute("href")
                    if href and "/maps/place/" in href:
                        collected_urls.add(href)
                
                # Scroll down
                page.mouse.wheel(delta_x=0, delta_y=4000)
                page.keyboard.press("PageDown")
                time.sleep(random.uniform(1.5, 3))
            
            # Close the main scrolling page to free memory
            page.close()
            
            # Phase 2: Open each URL deeply and extract data
            for url in list(collected_urls):
                if jobs[job_id]["_stop_flag"]:
                    jobs[job_id]["status"] = "stopped"
                    break
                    
                detail_page = context.new_page()
                lead_data = extract_deep_data(detail_page, url)
                detail_page.close()
                
                if lead_data and lead_data["businessName"]:
                    jobs[job_id]["results"].append(lead_data)
                
                # Add delay between deep requests to avoid ban
                time.sleep(random.uniform(0.5, 1.5))
            
            if jobs[job_id]["status"] == "running":
                jobs[job_id]["status"] = "completed"
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            jobs[job_id]["error"] = str(e)
            jobs[job_id]["status"] = "error"
            
        finally:
            browser.close()


@app.post("/scrape/start")
def scrape_start(request: ScrapeRequest):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "running", 
        "results": [], 
        "error": "", 
        "_stop_flag": False
    }
    thread = threading.Thread(target=_scrape_job, args=(job_id, request.keyword, request.location))
    thread.daemon = True
    thread.start()
    return {"job_id": job_id}

@app.get("/scrape/status/{job_id}")
def scrape_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job_data = jobs[job_id]
    return {
        "status": job_data["status"],
        "results": job_data["results"],
        "error": job_data["error"]
    }

@app.post("/scrape/stop/{job_id}")
def scrape_stop(job_id: str):
    if job_id in jobs:
        jobs[job_id]["_stop_flag"] = True
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
