const { supabase } = require('../config/db');

// ====================================================================
// 🟩 1. READ: PUBLIC VIEWPORT HANDSHAKE (Get Live Branding Manifest)
// ====================================================================
exports.getCMSManifest = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      // Agar row 1 database me nahi milti (Deleted state), toh server crash nahi hoga
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: "No active fashion configuration found in production registry. System requires initialization."
        });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// ====================================================================
// 🟨 2. EDIT/UPDATE: ADMIN CRM MUTATION (Modify Anything Live)
// ====================================================================
exports.adminUpdateCMSManifest = async (req, res, next) => {
  try {
    const { 
      logo_text, logo_image_url, accent_color_hex, bg_color_hex, text_color_hex, 
      navigation_menu, copyright_text, social_links,
      hero_eyebrow, hero_title_main, hero_title_highlight, hero_subtitle, 
      hero_images, hero_cta_text_1, hero_cta_link_1, hero_cta_text_2, hero_cta_link_2
    } = req.body;

    const updatePayload = {};
    
    // Core Identity & Theme Settings Overrides
    if (logo_text !== undefined) updatePayload.logo_text = logo_text.trim();
    if (logo_image_url !== undefined) updatePayload.logo_image_url = logo_image_url ? logo_image_url.trim() : null;
    if (accent_color_hex !== undefined) updatePayload.accent_color_hex = accent_color_hex.trim();
    if (bg_color_hex !== undefined) updatePayload.bg_color_hex = bg_color_hex.trim();
    if (text_color_hex !== undefined) updatePayload.text_color_hex = text_color_hex.trim();
    
    // Arrays and JSONB Objects Management (Directly Add/Delete links/images from Frontend State)
    if (navigation_menu !== undefined) updatePayload.navigation_menu = navigation_menu;
    if (social_links !== undefined) updatePayload.social_links = social_links;
    if (hero_images !== undefined) updatePayload.hero_images = hero_images;

    // Editorial Footer Configuration Updates
    if (copyright_text !== undefined) updatePayload.copyright_text = copyright_text.trim();

    // Premium Fashion Hero Section Parameters
    if (hero_eyebrow !== undefined) updatePayload.hero_eyebrow = hero_eyebrow.trim();
    if (hero_title_main !== undefined) updatePayload.hero_title_main = hero_title_main.trim();
    if (hero_title_highlight !== undefined) updatePayload.hero_title_highlight = hero_title_highlight.trim();
    if (hero_subtitle !== undefined) updatePayload.hero_subtitle = hero_subtitle.trim();
    if (hero_cta_text_1 !== undefined) updatePayload.hero_cta_text_1 = hero_cta_text_1.trim();
    if (hero_cta_link_1 !== undefined) updatePayload.hero_cta_link_1 = hero_cta_link_1.trim();
    if (hero_cta_text_2 !== undefined) updatePayload.hero_cta_text_2 = hero_cta_text_2.trim();
    if (hero_cta_link_2 !== undefined) updatePayload.hero_cta_link_2 = hero_cta_link_2.trim();

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('site_config')
      .update(updatePayload)
      .eq('id', 1)
      .select('*')
      .single();

    if (error) throw error;
    
    return res.status(200).json({ 
      success: true, 
      message: "Fashion dashboard registries and design layouts updated smoothly.", 
      data 
    });
  } catch (err) { 
    next(err); 
  }
};

// ====================================================================
// 🟦 3. ADD / INITIALIZE: RE-CREATE SYSTEM BLOCK (If Deleted or Fresh Setup)
// ====================================================================
exports.adminInitializeCMSManifest = async (req, res, next) => {
  try {
    // Check custom registry if config record already exists to prevent duplicate clustering leaks
    const { data: existingConfig } = await supabase
      .from('site_config')
      .select('id')
      .eq('id', 1)
      .single();

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: "Configuration instance already initialized. Use PUT /crm-update to modify layouts."
      });
    }

    // Default pristine factory seed layout variables parameters structure inject blueprint
    const defaultBaselineSeed = {
      id: 1,
      config_key: 'production_settings',
      logo_text: 'PREETI HAUTE COUTURE',
      bg_color_hex: '#EFECE3',
      text_color_hex: '#1A1A1A',
      accent_color_hex: '#C9A84C',
      navigation_menu: [
        { label: "Home", path: "/" },
        { label: "Collections", path: "/collections" },
        { label: "New Arrivals", path: "/new-arrivals" },
        { label: "The Studio", path: "/studio" },
        { label: "Editorial", path: "/editorial" },
        { label: "Contact", path: "/contact" }
      ],
      hero_eyebrow: 'HAUTE COUTURE · FALL WINTER 2026',
      hero_title_main: 'ARCHITECTURAL SILHOUETTES',
      hero_title_highlight: 'DEFINING MODERN LUXURY',
      hero_subtitle: 'A curated lineage of precision tailoring, fluid contours, and premium sustainable fabrics.',
      hero_images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80'
      ],
      hero_cta_text_1: 'EXPLORE COLLECTIONS',
      hero_cta_link_1: '/collections',
      hero_cta_text_2: 'THE STUDIO',
      hero_cta_link_2: '/studio',
      copyright_text: '© 2026 PREETI HAUTE COUTURE. All rights reserved.',
      social_links: { instagram: "https://instagram.com", x: "https://x.com", facebook: "https://facebook.com" }
    };

    const { data, error } = await supabase
      .from('site_config')
      .insert([defaultBaselineSeed])
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Brand system initialization parameters added successfully into database production layers.",
      data
    });
  } catch (err) {
    next(err);
  }
};

// ====================================================================
// 🟥 4. DELETE / RESET: CLEAR OVERRIDES (Wipe Out Rows or Factory Reset Settings)
// ====================================================================
exports.adminResetCMSManifest = async (req, res, next) => {
  try {
    // Purge action execution clearing configuration parameters registry block row 1 entirely
    const { error } = await supabase
      .from('site_config')
      .delete()
      .eq('id', 1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Active configuration row dropped and deleted completely from system registry matrix hooks."
    });
  } catch (err) {
    next(err);
  }
};