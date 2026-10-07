/**
 * Neo Digital Studio - Master Wedding Data Architecture
 * Dynamic, fully customizable data model for luxury Indian digital wedding invitations.
 */

window.weddingDataDefault = {
  studio: {
    name: "Neo Digital Studio",
    tagline: "Bespoke Luxury Digital Invitations",
    year: "2026"
  },

  sacred: {
    ganapathiEmblem: "assets/ganapathi.png",
    mantra: "॥ श्री गणेशाय नमः ॥",
    blessing: "Vakratunda Mahakaya Suryakoti Samaprabha • Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada"
  },

  invitation: {
    eyebrow: "THE WEDDING CELEBRATION",
    coupleDisplay: "Siddharth & Kiara",
    date: "Monday, October 12, 2026",
    time: "10:30 AM IST",
    eventDateTimeISO: "2026-10-12T10:30:00+05:30",
    verse: "Together with our families, we joyfully invite you to celebrate our union.",
    subheading: "Two families, many traditions, one timeless celebration.",
    musicUrl: "assets/wedding_music.mp3"
  },

  couple: {
    groom: {
      name: "Siddharth",
      fullName: "Siddharth Malhotra",
      relationTitle: "SON OF",
      parents: "Mrs. Sunita & Mr. Rajesh Malhotra",
      photo: "assets/groom.jpg",
      familyCity: "New Delhi, India"
    },
    bride: {
      name: "Kiara",
      fullName: "Kiara Kapoor",
      relationTitle: "DAUGHTER OF",
      parents: "Mrs. Poonam & Mr. Anand Kapoor",
      photo: "assets/bride.jpg",
      familyCity: "Mumbai, India"
    }
  },

  // 4. CELEBRATION SCHEDULE / WEDDING EVENTS
  eventsSection: {
    eyebrow: "WEDDING EVENTS",
    title: "CELEBRATION SCHEDULE",
    subtitle: "“Every ritual, every moment — beautifully planned for family and friends.”",
    events: [
      {
        id: "evt-1",
        category: "AUSPICIOUS BLESSING",
        icon: "om",
        title: "Ganesh Pooja & Mangala Snanam",
        description: "Invoking the divine blessings of Lord Vigneshwara for peace and auspiciousness, followed by traditional holy water blessings.",
        date: "Sunday, October 11, 2026",
        time: "09:00 AM – 11:30 AM",
        venue: "Shri Ganapathi Mandapam, Lake Courtyard",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur"
      },
      {
        id: "evt-2",
        category: "SUNLIT CELEBRATION",
        icon: "haldi",
        title: "Haldi Ceremony",
        description: "A joyful turmeric ceremony with blessings from elders and playful family rituals bathed in vibrant marigold hues.",
        date: "Sunday, October 11, 2026",
        time: "12:00 PM – 02:30 PM",
        venue: "The Marigold Courtyard & Fountain Pool",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur"
      },
      {
        id: "evt-3",
        category: "EVENING OF MELODY",
        icon: "music",
        title: "Sangeet & Royal Soirée",
        description: "An enchanting evening of live Sufi performances, choreographed family dances, culinary artistry, and timeless royal splendor.",
        date: "Sunday, October 11, 2026",
        time: "07:30 PM – Midnight",
        venue: "The Grand Regal Amphitheatre & Gardens",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur"
      },
      {
        id: "evt-4",
        category: "THE SACRED MUHURAT",
        icon: "vivah",
        title: "Wedding Ceremony (Vivah Sanskar)",
        description: "Sacred mantras, varmala and wedding rituals — the solemn Vedic pheras around the agni marking the beginning of an eternal journey.",
        date: "Monday, October 12, 2026",
        time: "10:30 AM – 02:00 PM",
        venue: "The Lake Pavilion Mandap, Udaipur",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur"
      },
      {
        id: "evt-5",
        category: "GALA RECEPTION",
        icon: "celebration",
        title: "Grand Wedding Reception",
        description: "A grand evening of dining, dancing, and celebrating the newlyweds under the majestic Rajasthan starlight.",
        date: "Monday, October 12, 2026",
        time: "07:30 PM Onwards",
        venue: "The Grand Royal Ballroom & Lake Terraces",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur"
      }
    ]
  },

  // 5. COUNTDOWN
  countdown: {
    eyebrow: "SACRED MUHURAT",
    title: "COUNTDOWN TO THE BIG DAY",
    subtitle: "“The auspicious moment is getting closer.”",
    targetDateTimeISO: "2026-10-12T10:30:00+05:30",
    completedMessage: "THE DAY HAS ARRIVED"
  },

  // 6. PHOTO GALLERY (CAPTURED CHAPTERS)
  gallery: {
    eyebrow: "CAPTURED CHAPTERS",
    title: "MEMORIES IN BLOOM",
    subtitle: "“A glimpse of moments leading to our celebration.”",
    photos: [
      {
        id: "gal-1",
        url: "assets/groom.jpg",
        title: "The Regal Groom",
        caption: "Siddharth in antique gold bespoke royal sherwani.",
        ratio: "portrait"
      },
      {
        id: "gal-2",
        url: "assets/bride.jpg",
        title: "The Radiant Bride",
        caption: "Kiara adorned in heritage royal maroon and antique gold jewelry.",
        ratio: "portrait"
      },
      {
        id: "gal-3",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        title: "Palace Reflections",
        caption: "Gentle stroll by the marble jharokhas of Udaipur under golden twilight.",
        ratio: "landscape"
      },
      {
        id: "gal-4",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
        title: "Eternal Vows & Flowers",
        caption: "Delicate sacred marigolds and rose petals preparing the mandap.",
        ratio: "square"
      },
      {
        id: "gal-5",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        title: "The Sacred Promise",
        caption: "Under the starlit pavilion, a sacred covenant of two loving hearts.",
        ratio: "landscape"
      },
      {
        id: "gal-6",
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80",
        title: "Joyous Moments Together",
        caption: "Shared laughter that turns every ritual into an everlasting memory.",
        ratio: "portrait"
      },
      {
        id: "gal-7",
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
        title: "Evening Lights & Celebration",
        caption: "The palace aglow with thousands of brass diyas welcoming honored guests.",
        ratio: "landscape"
      }
    ]
  },

  // 7. OUR STORY
  story: {
    eyebrow: "OUR STORY",
    title: "A SPECIAL GLIMPSE",
    subtitle: "“A special glimpse of the moments that led us here.”",
    timeline: [
      {
        id: "sty-1",
        tag: "AUTUMN 2022",
        title: "FIRST MEETING",
        description: "Our story began with a simple meeting over coffee on a tranquil October afternoon. A conversation meant for twenty minutes effortlessly blossomed into hours of shared laughter and kindred dreams.",
        icon: "sparkle"
      },
      {
        id: "sty-2",
        tag: "WINTER 2023",
        title: "A NEW CHAPTER",
        description: "Two lives slowly became one beautiful journey. Travelling through old fort cities, sharing quiet morning teas, and discovering how harmoniously our values, families, and hopes aligned.",
        icon: "heart"
      },
      {
        id: "sty-3",
        tag: "SPRING 2025",
        title: "THE PROPOSAL",
        description: "A promise to walk together forever. Under the tranquil evening lights by the lake in Udaipur, with rings exchanged and sacred blessings from our dearest parents, we chose each other for a lifetime.",
        icon: "ring"
      },
      {
        id: "sty-4",
        tag: "OCTOBER 2026",
        title: "THE WEDDING",
        description: "And now, forever begins. Surrounded by the warmth of family, sacred Vedic verses, and the grace of Lord Ganesha, we invite you to be part of our most treasured day.",
        icon: "mandap"
      }
    ]
  },

  // 8. VENUE & TRAVEL
  venueAndTravel: {
    eyebrow: "VENUE GUIDE",
    title: "VENUE & TRAVEL",
    subtitle: "“Save the date and arrive with ease.”",
    venues: [
      {
        id: "ven-1",
        eventName: "Haldi & Ganesh Pooja",
        date: "Sunday, October 11, 2026",
        time: "09:00 AM – 02:30 PM",
        venueName: "Shri Ganapathi Courtyard · The Oberoi Udaivilas",
        address: "Badi-Gorela-Mulla Talao Road, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur",
        mapQuery: "The+Oberoi+Udaivilas+Udaipur"
      },
      {
        id: "ven-2",
        eventName: "Wedding Ceremony & Grand Reception",
        date: "Monday, October 12, 2026",
        time: "10:30 AM Onwards",
        venueName: "The Royal Lake Pavilion & Ballrooms",
        address: "Lake Pichola Shore, Haridas Ji Ki Magri, Udaipur, Rajasthan 313001",
        mapsUrl: "https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur",
        directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=The+Oberoi+Udaivilas+Udaipur",
        mapQuery: "The+Oberoi+Udaivilas+Udaipur"
      }
    ],
    travelNotes: [
      "Arrive 30 minutes early to comfortably enjoy the welcome refreshments and ceremonial music.",
      "Traditional Indian attire is warmly encouraged throughout all ceremonial festivities.",
      "Dedicated complimentary valet parking and golf-buggy transit available on-site.",
      "Royal concierge desk available at the palace lobby for all guest accommodations and queries."
    ]
  },

  // 9. LIVE STREAM
  liveStream: {
    enabled: true,
    badge: "🔴 LIVE STREAM",
    title: "WATCH LIVE",
    subtitle: "Can't make it in person? Join us virtually as we celebrate this beautiful moment together.",
    streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replaceable via admin
    buttonText: "JOIN LIVE STREAM",
    platform: "YouTube Live Broadcast",
    broadcastTime: "October 12, 2026 · 10:15 AM IST"
  }
};

// Initialize working dataset
window.weddingData = window.weddingDataDefault;
