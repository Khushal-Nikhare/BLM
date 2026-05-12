import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import authRoutes from './routes/auth.js';
import { verifyToken, verifyAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL  // Use Render dashboard to set this
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes
app.use('/api/auth', authRoutes);

// Add a test endpoint
app.get('/', (req, res) => res.send('BLM API is running'));

// ----------------------------------------------------
// Google Places Integration
// ----------------------------------------------------
app.get('/api/search', verifyToken, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return res.status(500).json({ error: 'Google Places API key is not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await axios.get(url);
    const results = response.data.results.map((place) => ({
      googlePlaceId: place.place_id,
      businessName: place.name,
      address: place.formatted_address,
      rating: place.rating,
      googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    }));
    
    // In a real app we might need an additional Place Details call for complete info (like website and phone). 
    // We'll return basic search data first. The user can enrich it later when saving.
    res.json({ results });
  } catch (error) {
    console.error('Error fetching from Google Places:', error.message);
    res.status(500).json({ error: 'Failed to fetch places data' });
  }
});

app.get('/api/place-details/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&fields=name,rating,formatted_phone_number,website,formatted_address&key=${apiKey}`;
    const response = await axios.get(url);
    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// ----------------------------------------------------
// DB CRUD Operations for Leads
// ----------------------------------------------------
app.get('/api/leads', verifyToken, async (req, res) => {
  try {
    const whereClause = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.post('/api/leads', verifyToken, async (req, res) => {
  try {
    const leadData = { ...req.body, userId: req.user.id };
    if (leadData.googlePlaceId) {
      const existing = await prisma.lead.findUnique({
        where: { googlePlaceId: leadData.googlePlaceId }
      });
      if (existing) {
        return res.status(400).json({ error: 'Lead already saved' });
      }
    }
    
    const lead = await prisma.lead.create({
      data: leadData
    });
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.post('/api/leads/bulk', verifyToken, async (req, res) => {
  try {
    let leadsData = req.body; // Expects an array
    if (!Array.isArray(leadsData) || leadsData.length === 0) {
       return res.status(400).json({ error: 'Expected an array of leads' });
    }
    
    // Attach userId to all imported leads
    leadsData = leadsData.map(lead => ({ ...lead, userId: req.user.id }));
    
    // SQLite does not support `skipDuplicates` in `createMany`.
    // Instead, we sequentially insert them and manually ignore duplicates securely.
    let count = 0;
    for (const leadData of leadsData) {
      try {
        if (leadData.googlePlaceId) {
          const existing = await prisma.lead.findUnique({ 
            where: { googlePlaceId: leadData.googlePlaceId } 
          });
          if (existing) {
            // Update the record with new information if it exists, preserving custom tags/statuses
            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                businessName: leadData.businessName,
                address: leadData.address,
                phoneNumber: leadData.phoneNumber || existing.phoneNumber,
                website: leadData.website || existing.website,
                googleMapsLink: leadData.googleMapsLink || existing.googleMapsLink,
                rating: leadData.rating || existing.rating,
                // Only overwrite searchKeyword if they uploaded a new one
                searchKeyword: leadData.searchKeyword || existing.searchKeyword,
              }
            });
            count++;
            continue;
          }
        }
        await prisma.lead.create({ data: leadData });
        count++;
      } catch (err) {
        // gracefully skip rows with validation errors
        console.warn(`Skipped a row: ${err.message}`);
      }
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    res.status(500).json({ error: 'Failed to bulk import leads', details: error.message });
  }
});

app.patch('/api/leads/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: req.body
    });
    res.json(updatedLead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.delete('/api/leads/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lead.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
