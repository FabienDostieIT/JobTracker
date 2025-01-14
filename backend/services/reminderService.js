const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

class ReminderService {
  constructor() {
    this.reminders = new Map();
    this.transporter = null;
    this.setupEmailTransporter();
  }

  async setupEmailTransporter() {
    try {
      const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      const accessToken = await oauth2Client.getAccessToken();

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken
        }
      });
    } catch (error) {
      console.error('Erreur lors de la configuration du transporteur email:', error);
    }
  }

  calculateReminderTime(interviewDate, timing) {
    const date = new Date(interviewDate);
    switch (timing) {
      case '1hour':
        date.setHours(date.getHours() - 1);
        break;
      case '3hours':
        date.setHours(date.getHours() - 3);
        break;
      case '1day':
        date.setDate(date.getDate() - 1);
        break;
      case '2days':
        date.setDate(date.getDate() - 2);
        break;
      case '1week':
        date.setDate(date.getDate() - 7);
        break;
      default:
        date.setDate(date.getDate() - 1); // Par défaut 1 jour avant
    }
    return date;
  }

  async scheduleReminder(interview, settings) {
    const reminderTime = this.calculateReminderTime(interview.date, settings.timing);
    
    // Annuler le rappel existant si présent
    if (this.reminders.has(interview._id)) {
      clearTimeout(this.reminders.get(interview._id));
    }

    const timeUntilReminder = reminderTime.getTime() - Date.now();
    if (timeUntilReminder <= 0) {
      console.log('La date de rappel est déjà passée');
      return;
    }

    const timeout = setTimeout(async () => {
      await this.sendReminderEmail(interview, settings);
      if (settings.sendCalendarInvite) {
        await this.sendCalendarInvite(interview, settings);
      }
      this.reminders.delete(interview._id);
    }, timeUntilReminder);

    this.reminders.set(interview._id, timeout);
  }

  async sendReminderEmail(interview, settings) {
    const emailList = [settings.email, ...settings.additionalEmails].filter(Boolean);
    
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: emailList.join(', '),
      subject: `Rappel: Entrevue avec ${interview.entreprise}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #425f99;">Rappel d'entrevue</h2>
          <p>Bonjour,</p>
          <p>Ceci est un rappel pour votre entrevue prévue avec <strong>${interview.entreprise}</strong>.</p>
          <div style="background-color: #f0f4f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> ${new Date(interview.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            <p><strong>Heure:</strong> ${new Date(interview.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            ${interview.location ? `<p><strong>Lieu:</strong> ${interview.location}</p>` : ''}
            ${interview.notes ? `<p><strong>Notes:</strong> ${interview.notes}</p>` : ''}
          </div>
          <p>Bonne chance pour votre entrevue !</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(emailContent);
      console.log('Email de rappel envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  }

  async sendCalendarInvite(interview, settings) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    const event = {
      summary: `Entrevue - ${interview.entreprise}`,
      location: interview.location,
      description: interview.notes,
      start: {
        dateTime: new Date(interview.date).toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(new Date(interview.date).getTime() + 3600000).toISOString(), // +1 heure par défaut
        timeZone: 'Europe/Paris',
      },
      attendees: [
        { email: settings.email },
        ...settings.additionalEmails.map(email => ({ email }))
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    try {
      await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all',
      });
      console.log('Invitation calendar envoyée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation calendar:', error);
    }
  }

  cancelReminder(interviewId) {
    if (this.reminders.has(interviewId)) {
      clearTimeout(this.reminders.get(interviewId));
      this.reminders.delete(interviewId);
    }
  }
}

module.exports = new ReminderService(); 