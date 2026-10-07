-- ==============================================================================
-- NEO DIGITAL STUDIO - PRODUCTION SUPABASE / POSTGRESQL SCHEMA
-- Multi-Tenant Luxury Indian Wedding Invitation Platform
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'studio_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Templates Table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    theme_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Weddings Table (Core Tenant)
CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    template_slug TEXT NOT NULL DEFAULT 'royal-red',
    title TEXT NOT NULL,
    status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
    is_published BOOLEAN DEFAULT TRUE,
    music_enabled BOOLEAN DEFAULT TRUE,
    music_url TEXT DEFAULT 'assets/wedding_music.mp3',
    live_stream_enabled BOOLEAN DEFAULT FALSE,
    live_stream_url TEXT,
    rsvp_enabled BOOLEAN DEFAULT TRUE,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Couples Details Table
CREATE TABLE IF NOT EXISTS couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE UNIQUE,
    groom_name TEXT NOT NULL,
    bride_name TEXT NOT NULL,
    groom_full_name TEXT,
    bride_full_name TEXT,
    groom_parents TEXT,
    bride_parents TEXT,
    groom_city TEXT,
    bride_city TEXT,
    groom_photo_url TEXT,
    bride_photo_url TEXT,
    wedding_date_display TEXT NOT NULL,
    wedding_time_display TEXT,
    wedding_datetime_iso TIMESTAMP WITH TIME ZONE NOT NULL,
    hashtag TEXT DEFAULT '#WeddingCelebration',
    invitation_verse TEXT,
    subheading TEXT
);

-- 6. Events / Celebration Schedule Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'CEREMONY',
    icon TEXT DEFAULT 'vivah',
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    event_time TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    maps_url TEXT,
    directions_url TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    caption TEXT,
    aspect_ratio TEXT DEFAULT 'portrait', -- 'portrait', 'landscape', 'square'
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Our Story Timeline Table
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    tag TEXT DEFAULT 'CHAPTER',
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'heart',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Venues & Travel Table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    address TEXT NOT NULL,
    maps_url TEXT,
    directions_url TEXT,
    order_index INT DEFAULT 0
);

-- 10. Travel Notes Table
CREATE TABLE IF NOT EXISTS travel_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    order_index INT DEFAULT 0
);

-- 11. RSVPs Table (Protected - Guest Submissions)
CREATE TABLE IF NOT EXISTS rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    attendance_status TEXT NOT NULL, -- 'accepted', 'declined'
    blessings_message TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    submission_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Studio Settings
CREATE TABLE IF NOT EXISTS studio_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_name TEXT DEFAULT 'Neo Digital Studio',
    studio_tagline TEXT DEFAULT 'Handcrafted Luxury Digital Invitations',
    admin_pin TEXT DEFAULT '1234',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_weddings_slug ON weddings(slug);
CREATE INDEX IF NOT EXISTS idx_events_wedding_id ON events(wedding_id, order_index);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding_id ON gallery_images(wedding_id, order_index);
CREATE INDEX IF NOT EXISTS idx_stories_wedding_id ON stories(wedding_id, order_index);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_id ON rsvps(wedding_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Security Rule: Public can view wedding info and submit RSVPs.
-- RSVPs CANNOT be viewed publicly; only authenticated admins can view RSVPs.
-- ==============================================================================
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Public can view published weddings
CREATE POLICY "Public can view published weddings" ON weddings
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published couples" ON couples
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = couples.wedding_id AND weddings.is_published = true));

CREATE POLICY "Public can view published events" ON events
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = events.wedding_id AND weddings.is_published = true));

CREATE POLICY "Public can view published gallery" ON gallery_images
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = gallery_images.wedding_id AND weddings.is_published = true));

CREATE POLICY "Public can view published stories" ON stories
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = stories.wedding_id AND weddings.is_published = true));

CREATE POLICY "Public can view published venues" ON venues
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = venues.wedding_id AND weddings.is_published = true));

CREATE POLICY "Public can view published travel notes" ON travel_notes
    FOR SELECT USING (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = travel_notes.wedding_id AND weddings.is_published = true));

-- Public can SUBMIT RSVPs (Insert only)
CREATE POLICY "Public can submit RSVPs" ON rsvps
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM weddings WHERE weddings.id = rsvps.wedding_id AND weddings.is_published = true AND weddings.rsvp_enabled = true));

-- Public CANNOT read RSVPs (Select policy only for authenticated admin users)
CREATE POLICY "Admins can view RSVPs" ON rsvps
    FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- SEED INITIAL TEMPLATES
-- ==============================================================================
INSERT INTO templates (slug, name, description, theme_tokens)
VALUES 
('royal-red', 'Royal Red & Deep Maroon', 'Signature regal Indian luxury with deep maroon, rich burgundy and antique gold filigree.', '{"primaryBg":"#160408","secondaryBg":"#340a14","goldAccent":"#d4af37","textColor":"#faf6ee"}'::jsonb),
('floral-romance', 'Floral Romance & Rose Burgundy', 'Soft romantic botanical elegance with velvet rose burgundy and warm champagne gold.', '{"primaryBg":"#1f050e","secondaryBg":"#3d0f1e","goldAccent":"#e5b977","textColor":"#fbf5f0"}'::jsonb),
('kerala-traditional', 'Kerala Traditional & Temple Gold', 'Temple architectural majesty with sacred kasavu gold, rich temple ivory and vermilion.', '{"primaryBg":"#190606","secondaryBg":"#360e0e","goldAccent":"#e6b800","textColor":"#fff9e6"}'::jsonb),
('minimal-luxury', 'Minimal Luxury & Dark Velvet', 'Ultra-modern quiet luxury with midnight velvet maroon, hairline antique gold rules.', '{"primaryBg":"#120306","secondaryBg":"#25060d","goldAccent":"#d8b056","textColor":"#f5f5f5"}'::jsonb),
('cinematic-gold', 'Cinematic Royal Gold', 'High-drama cinematic visual presence with gleaming royal gold accents on deep wine red.', '{"primaryBg":"#1c0409","secondaryBg":"#440b19","goldAccent":"#ffd700","textColor":"#ffffff"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
