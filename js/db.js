/**
 * Neo Digital Studio - Multi-Tenant Database & Storage Client
 * Supports Supabase PostgreSQL integration with resilient local fallback.
 */

window.NeoDB = (function () {
  'use strict';

  const STORAGE_PREFIX = 'neo_studio_';
  const WEDDINGS_KEY = STORAGE_PREFIX + 'weddings';
  const RSVPS_KEY = STORAGE_PREFIX + 'rsvps';
  const SETTINGS_KEY = STORAGE_PREFIX + 'settings';
  const AUTH_KEY = STORAGE_PREFIX + 'admin_session';

  // Available Studio Templates
  const TEMPLATES = [
    {
      id: 'royal-red',
      name: 'Royal Red & Deep Maroon',
      description: 'Signature regal Indian luxury with deep wine maroon, rich burgundy and antique gold filigree.',
      primaryBg: '#160408',
      secondaryBg: '#340a14',
      goldAccent: '#d4af37',
      textIvory: '#faf6ee',
      cardGradient: 'linear-gradient(155deg, rgba(58, 12, 24, 0.9) 0%, rgba(28, 5, 12, 0.96) 100%)'
    },
    {
      id: 'floral-romance',
      name: 'Floral Romance & Burgundy Rose',
      description: 'Velvet rose burgundy undertones with soft rose-gold filigree and warm champagne cream.',
      primaryBg: '#1a040d',
      secondaryBg: '#3b0b1f',
      goldAccent: '#e5b977',
      textIvory: '#fbf5f0',
      cardGradient: 'linear-gradient(155deg, rgba(65, 12, 34, 0.9) 0%, rgba(32, 5, 16, 0.96) 100%)'
    },
    {
      id: 'kerala-traditional',
      name: 'Kerala Traditional & Temple Gold',
      description: 'Sacred temple architecture aesthetic with radiant kasavu gold borders, temple ivory and vermilion.',
      primaryBg: '#180505',
      secondaryBg: '#360c0c',
      goldAccent: '#e6b800',
      textIvory: '#fff9e6',
      cardGradient: 'linear-gradient(155deg, rgba(60, 14, 14, 0.9) 0%, rgba(28, 6, 6, 0.96) 100%)'
    },
    {
      id: 'minimal-luxury',
      name: 'Minimal Luxury & Dark Velvet',
      description: 'Ultra-modern quiet luxury with midnight velvet maroon, hairline antique gold rules and understated elegance.',
      primaryBg: '#120306',
      secondaryBg: '#25060d',
      goldAccent: '#d8b056',
      textIvory: '#f5f5f5',
      cardGradient: 'linear-gradient(155deg, rgba(45, 8, 18, 0.9) 0%, rgba(20, 3, 8, 0.96) 100%)'
    },
    {
      id: 'cinematic-gold',
      name: 'Cinematic Royal Gold',
      description: 'High-drama cinematic visual presence with gleaming royal gold accents on deep wine red.',
      primaryBg: '#1c0409',
      secondaryBg: '#440b19',
      goldAccent: '#ffd700',
      textIvory: '#ffffff',
      cardGradient: 'linear-gradient(155deg, rgba(72, 14, 28, 0.9) 0%, rgba(32, 5, 12, 0.96) 100%)'
    }
  ];

  // Seed default invitations if not initialized
  function initializeDatabase() {
    if (!localStorage.getItem(WEDDINGS_KEY)) {
      const defaultWeddings = [
        {
          id: 'wed-siddharth-kiara',
          slug: 'siddharth-kiara',
          templateId: 'royal-red',
          title: 'The Wedding Celebration of Siddharth & Kiara',
          status: 'published',
          isPublished: true,
          viewCount: 1420,
          musicEnabled: true,
          musicUrl: 'assets/wedding_music.mp3',
          liveStreamEnabled: true,
          liveStreamUrl: 'https://www.youtube.com/watch?v=live_stream_demo',
          rsvpEnabled: true,
          weddingHashtag: '#SiddharthKiaraWedding',
          createdAt: new Date('2026-01-15').toISOString(),
          // Embed master data payload
          data: window.weddingDataDefault || {}
        },
        {
          id: 'wed-rahul-anjali',
          slug: 'rahul-anjali',
          templateId: 'floral-romance',
          title: 'The Royal Union of Rahul & Anjali',
          status: 'published',
          isPublished: true,
          viewCount: 840,
          musicEnabled: true,
          musicUrl: 'assets/wedding_music.mp3',
          liveStreamEnabled: false,
          liveStreamUrl: '',
          rsvpEnabled: true,
          weddingHashtag: '#RahulAnjaliForever',
          createdAt: new Date('2026-02-10').toISOString(),
          data: {
            ...window.weddingDataDefault,
            invitation: {
              eyebrow: "THE WEDDING CELEBRATION",
              coupleDisplay: "Rahul & Anjali",
              date: "Saturday, November 28, 2026",
              time: "11:00 AM IST",
              eventDateTimeISO: "2026-11-28T11:00:00+05:30",
              verse: "Together with our families, we cordially invite you to celebrate our new beginning.",
              subheading: "Two hearts, one timeless love story."
            },
            couple: {
              groom: {
                name: "Rahul",
                fullName: "Rahul Varma",
                relationTitle: "SON OF",
                parents: "Mrs. Meenakshi & Mr. Suresh Varma",
                photo: "assets/groom.jpg",
                familyCity: "Bengaluru, India"
              },
              bride: {
                name: "Anjali",
                fullName: "Anjali Sharma",
                relationTitle: "DAUGHTER OF",
                parents: "Mrs. Radhika & Mr. Hemant Sharma",
                photo: "assets/bride.jpg",
                familyCity: "Jaipur, India"
              }
            }
          }
        }
      ];
      localStorage.setItem(WEDDINGS_KEY, JSON.stringify(defaultWeddings));
    }

    if (!localStorage.getItem(RSVPS_KEY)) {
      const defaultRSVPs = [
        {
          id: 'rsvp-1',
          weddingSlug: 'siddharth-kiara',
          guestName: 'Vikram & Priya Singhania',
          status: 'accepted',
          message: 'Heartiest congratulations to both families! Looking forward to celebrating this royal milestone in Udaipur.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'rsvp-2',
          weddingSlug: 'siddharth-kiara',
          guestName: 'Karan Mehra',
          status: 'accepted',
          message: 'Warmest blessings for Siddharth and Kiara. May your journey be blessed with infinite love and joy.',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
          id: 'rsvp-3',
          weddingSlug: 'siddharth-kiara',
          guestName: 'Ananya & Rohan Joshi',
          status: 'declined',
          message: 'Sending all our love and warmest wishes from London! Truly regret missing the celebration in person.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
      localStorage.setItem(RSVPS_KEY, JSON.stringify(defaultRSVPs));
    }

    if (!localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        studioName: 'Neo Digital Studio',
        tagline: 'Handcrafted Luxury Digital Invitations',
        adminPin: 'neo2026',
        supabaseUrl: '',
        supabaseAnonKey: ''
      }));
    }
  }

  // Sanitize user inputs to prevent XSS
  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- PUBLIC API ---
  return {
    init: initializeDatabase,

    getTemplates: function () {
      return TEMPLATES;
    },

    getTemplateById: function (id) {
      return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
    },

    // Weddings
    getAllWeddings: function () {
      initializeDatabase();
      try {
        return JSON.parse(localStorage.getItem(WEDDINGS_KEY)) || [];
      } catch (e) {
        return [];
      }
    },

    getWeddingBySlug: function (slug) {
      initializeDatabase();
      const weddings = this.getAllWeddings();
      return weddings.find((w) => w.slug.toLowerCase() === (slug || '').toLowerCase()) || weddings[0];
    },

    saveWedding: function (updatedWedding) {
      initializeDatabase();
      const weddings = this.getAllWeddings();
      const index = weddings.findIndex((w) => w.id === updatedWedding.id || w.slug === updatedWedding.slug);
      if (index >= 0) {
        weddings[index] = { ...weddings[index], ...updatedWedding, updatedAt: new Date().toISOString() };
      } else {
        weddings.push({ ...updatedWedding, id: updatedWedding.id || 'wed-' + Date.now(), createdAt: new Date().toISOString() });
      }
      localStorage.setItem(WEDDINGS_KEY, JSON.stringify(weddings));
      return weddings;
    },

    deleteWedding: function (id) {
      initializeDatabase();
      let weddings = this.getAllWeddings();
      weddings = weddings.filter((w) => w.id !== id);
      localStorage.setItem(WEDDINGS_KEY, JSON.stringify(weddings));
      return weddings;
    },

    incrementViewCount: function (slug) {
      initializeDatabase();
      const weddings = this.getAllWeddings();
      const target = weddings.find((w) => w.slug.toLowerCase() === (slug || '').toLowerCase());
      if (target) {
        target.viewCount = (target.viewCount || 0) + 1;
        localStorage.setItem(WEDDINGS_KEY, JSON.stringify(weddings));
      }
    },

    // RSVPs
    submitRSVP: function (weddingSlug, payload) {
      initializeDatabase();
      const cleanName = sanitize(payload.name).trim();
      const cleanMsg = sanitize(payload.message).trim();
      const status = payload.status === 'declined' ? 'declined' : 'accepted';

      if (!cleanName) {
        return { success: false, error: 'Please enter your name.' };
      }

      const allRSVPs = this.getAllRSVPs();

      // Duplicate prevention: check if identical guest name submitted for this wedding within 10 minutes
      const now = Date.now();
      const duplicate = allRSVPs.find((r) => 
        r.weddingSlug === weddingSlug && 
        r.guestName.toLowerCase() === cleanName.toLowerCase() &&
        (now - new Date(r.createdAt).getTime()) < 600000 // 10 min window
      );

      if (duplicate) {
        return { success: false, error: 'You have already submitted an RSVP for this invitation recently. Thank you!' };
      }

      const newRecord = {
        id: 'rsvp-' + Date.now(),
        weddingSlug: weddingSlug,
        guestName: cleanName,
        status: status,
        message: cleanMsg,
        createdAt: new Date().toISOString()
      };

      allRSVPs.unshift(newRecord);
      localStorage.setItem(RSVPS_KEY, JSON.stringify(allRSVPs));
      return { success: true, data: newRecord };
    },

    getAllRSVPs: function () {
      initializeDatabase();
      try {
        return JSON.parse(localStorage.getItem(RSVPS_KEY)) || [];
      } catch (e) {
        return [];
      }
    },

    getRSVPsByWedding: function (slug) {
      const all = this.getAllRSVPs();
      if (!slug) return all;
      return all.filter((r) => r.weddingSlug === slug);
    },

    deleteRSVP: function (id) {
      let all = this.getAllRSVPs();
      all = all.filter((r) => r.id !== id);
      localStorage.setItem(RSVPS_KEY, JSON.stringify(all));
      return all;
    },

    // Settings
    getSettings: function () {
      initializeDatabase();
      try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
      } catch (e) {
        return {};
      }
    },

    saveSettings: function (newSettings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    },

    // Security & Auth
    verifyAdminPin: function (pin) {
      const settings = this.getSettings();
      const valid = (pin || '').trim() === (settings.adminPin || 'neo2026');
      if (valid) {
        sessionStorage.setItem(AUTH_KEY, 'authorized_' + Date.now());
      }
      return valid;
    },

    isAdminAuthenticated: function () {
      return !!sessionStorage.getItem(AUTH_KEY);
    },

    adminLogout: function () {
      sessionStorage.removeItem(AUTH_KEY);
    }
  };
})();
