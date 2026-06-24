const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

// ====================================================================
// 🟩 1. READ: PUBLIC VIEWPORT HANDSHAKE (Get Live Branding Manifest)
// ====================================================================
exports.getCMSManifest = async (req, res, next) => {
  try {
    console.log("[CMS ENGINE]: Hydrating system design parameters from row 1...");
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error("❌ [SUPABASE CMS FETCH FAULT]:", error.message);
      return next(error);
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No active fashion configuration found in production registry. System requires initialization."
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// ====================================================================
// 🟨 2. EDIT/UPDATE: BULLETPROOF SYSTEM MUTATION (Handles Deletes/Edits)
// ====================================================================
exports.adminUpdateCMSManifest = async (req, res, next) => {
  try {
    console.log("[CMS ENGINE]: Intercepting inbound brand configuration payload...");
    
    const { 
      logo_text, logo_image_url, accent_color_hex, bg_color_hex, text_color_hex, 
      navigation_menu, copyright_text, social_links,
      hero_eyebrow, hero_title_main, hero_title_highlight, hero_subtitle, 
      hero_images, hero_cta_text_1, hero_cta_link_1, hero_cta_text_2, hero_cta_link_2, features_list
    } = req.body;

    const updatePayload = {};
    
    // Core Identity Strings Overrides
    if (logo_text !== undefined) updatePayload.logo_text = logo_text.trim();
    if (logo_image_url !== undefined) updatePayload.logo_image_url = logo_image_url ? logo_image_url.trim() : null;
    if (accent_color_hex !== undefined) updatePayload.accent_color_hex = accent_color_hex.trim();
    if (bg_color_hex !== undefined) updatePayload.bg_color_hex = bg_color_hex.trim();
    if (text_color_hex !== undefined) updatePayload.text_color_hex = text_color_hex.trim();
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

    // ====================================================================
    // 🔥 CRITICAL ARRAY AND JSONB HANDLERS (Ensures clean state deletions)
    // ====================================================================
    if (navigation_menu !== undefined) {
      updatePayload.navigation_menu = Array.isArray(navigation_menu) ? navigation_menu : [];
    }
    
    if (hero_images !== undefined) {
      updatePayload.hero_images = Array.isArray(hero_images) ? hero_images.filter(Boolean) : [];
    }

    if (features_list !== undefined) {
      updatePayload.features_list = Array.isArray(features_list) ? features_list : [];
    }

    if (social_links !== undefined) {
      updatePayload.social_links = typeof social_links === 'object' ? social_links : {};
    }

    updatePayload.updated_at = new Date().toISOString();

    console.log("💾 [CMS ENGINE]: Committing mutation parameters payload into Supabase row 1...");
    
    const { data, error } = await supabase
      .from('site_config')
      .update(updatePayload)
      .eq('id', 1)
      .select('*')
      .single();

    if (error) {
      console.error("❌ [SUPABASE UPDATE ERROR CRITICAL]:", error.message);
      throw error;
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Fashion dashboard registries and design layouts updated smoothly.", 
      data 
    });
  } catch (err) { 
    next(err); 
  }
}; // ✅ Broken comment tags removed cleanly from here!

// ====================================================================
// 🟦 3. ADD / INITIALIZE: FACTORY RESET SEEDER LAYER
// ====================================================================
exports.adminInitializeCMSManifest = async (req, res, next) => {
  try {
    const { data: existingConfig } = await supabase
      .from('site_config')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: "Configuration instance already initialized. Use PUT /crm-update to modify layouts."
      });
    }

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
      social_links: { instagram: "https://instagram.com", x: "https://x.com", facebook: "https://facebook.com" },
      features_list: [
        { title: "High Quality Fabrics", description: "Our outfits are cut from premium fabrics with a fit so good, that it feels custom made, just for you." },
        { title: "Free Shipping", description: "Free shipping is available on all prepaid orders above 1500 within India." },
        { title: "In-House Production", description: "We have full control over the quality of products since we are one of the few brands that designs & produces its own garment." }
      ]
    };

    const { data, error } = await supabase
      .from('site_config')
      .insert([defaultBaselineSeed])
      .select('*')
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Brand system initialization parameters added successfully.",
      data
    });
  } catch (err) {
    next(err);
  }
};

// ====================================================================
// 🕶️ 4. AUTH: HIDDEN GATE HANDSHAKE (Validates against server .env)
// ====================================================================
exports.adminSecretLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Credential parameters are mandatory." });
    }

    // Exact environment matching execution
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      
      const token = jwt.sign(
        { email: email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      console.log(`🔑 [CMS AUTH SUCCESS]: Verified administrative session for: ${email}`);
      return res.status(200).json({
        success: true,
        message: "Authentication handshake verified successfully.",
        token: token
      });
    }

    console.warn(`⚠️ [CMS AUTH REJECTION]: Access signature match failed for email entry: ${email}`);
    return res.status(401).json({ success: false, message: "Invalid administrative credentials match." });

  } catch (err) {
    next(err);
  }
};