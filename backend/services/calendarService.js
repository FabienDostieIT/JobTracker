const { google } = require('googleapis');

class CalendarService {
  constructor(accessToken) {
    this.calendar = google.calendar({
      version: 'v3',
      auth: new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
    });
    this.calendar.context._options.auth.setCredentials({
      access_token: accessToken
    });
  }

  async createInterviewEvent(contact) {
    try {
      const event = {
        summary: `Entretien - ${contact.entreprise} (${contact.poste})`,
        description: `Entretien pour le poste de ${contact.poste} chez ${contact.entreprise}\n\n` +
          `Email: ${contact.emailEmployeur}\n` +
          `Téléphone: ${contact.telephoneContact}\n\n` +
          `Notes: ${contact.commentaires || 'Aucune note'}`,
        start: {
          dateTime: new Date(contact.dateEntretien).toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: new Date(new Date(contact.dateEntretien).getTime() + 60*60*1000).toISOString(), // 1 hour duration
          timeZone: 'Europe/Paris',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  async updateInterviewEvent(eventId, contact) {
    try {
      const event = {
        summary: `Entretien - ${contact.entreprise} (${contact.poste})`,
        description: `Entretien pour le poste de ${contact.poste} chez ${contact.entreprise}\n\n` +
          `Email: ${contact.emailEmployeur}\n` +
          `Téléphone: ${contact.telephoneContact}\n\n` +
          `Notes: ${contact.commentaires || 'Aucune note'}`,
        start: {
          dateTime: new Date(contact.dateEntretien).toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: new Date(new Date(contact.dateEntretien).getTime() + 60*60*1000).toISOString(),
          timeZone: 'Europe/Paris',
        },
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  async deleteInterviewEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }
}

module.exports = CalendarService; 