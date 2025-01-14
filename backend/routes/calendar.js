const express = require('express');
const router = express.Router();
const CalendarService = require('../services/calendarService');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Create calendar event for interview
router.post('/events', isAuthenticated, async (req, res) => {
  try {
    const calendarService = new CalendarService(req.user.accessToken);
    const result = await calendarService.createInterviewEvent(req.body);
    res.json(result);
  } catch (error) {
    console.error('Calendar event creation error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update calendar event
router.put('/events/:eventId', isAuthenticated, async (req, res) => {
  try {
    const calendarService = new CalendarService(req.user.accessToken);
    const result = await calendarService.updateInterviewEvent(req.params.eventId, req.body);
    res.json(result);
  } catch (error) {
    console.error('Calendar event update error:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete calendar event
router.delete('/events/:eventId', isAuthenticated, async (req, res) => {
  try {
    const calendarService = new CalendarService(req.user.accessToken);
    const result = await calendarService.deleteInterviewEvent(req.params.eventId);
    res.json(result);
  } catch (error) {
    console.error('Calendar event deletion error:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

module.exports = router; 