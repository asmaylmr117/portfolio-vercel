/**
 * Seed Script - Populate PostgreSQL database with initial data
 * Run: node seed.js
 */

require('dotenv').config();
const { pool, initDB } = require('./db');

const BASE_URL = '/images';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await initDB();
    console.log('Database initialized.\n');

    // ============================================================
    // 1. SEED SERVICES
    // ============================================================
    console.log('Seeding services...');
    const services = [
      {
        id: '1', sImg: `${BASE_URL}/services/service_image_1.webp`,
        title: 'Web Development', slug: 'web-development',
        thumb1: `${BASE_URL}/services/service_details_image_1.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_2.webp`,
        col: 'col-lg-4',
        description: 'We build modern, responsive, and high-performance websites using the latest technologies. From corporate sites to complex web applications, our team delivers pixel-perfect solutions that drive results.',
        features: ['Responsive Design', 'SEO Optimization', 'Performance Tuning', 'Cross-Browser Support', 'CMS Integration'],
        price: 2500, duration: '4-8 weeks', isActive: true, popular: true
      },
      {
        id: '2', sImg: `${BASE_URL}/services/service_image_2.webp`,
        title: 'Mobile App Development', slug: 'mobile-app-development',
        thumb1: `${BASE_URL}/services/service_details_image_3.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_4.webp`,
        col: 'col-lg-4',
        description: 'Native and cross-platform mobile applications for iOS and Android. We create intuitive, feature-rich apps that provide seamless user experiences across all devices.',
        features: ['iOS & Android', 'React Native', 'Flutter', 'Push Notifications', 'Offline Support'],
        price: 5000, duration: '8-16 weeks', isActive: true, popular: true
      },
      {
        id: '3', sImg: `${BASE_URL}/services/service_image_3.webp`,
        title: 'UI/UX Design', slug: 'ui-ux-design',
        thumb1: `${BASE_URL}/services/service_details_image_5.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_1.webp`,
        col: 'col-lg-4',
        description: 'User-centered design that combines aesthetics with functionality. We create beautiful interfaces and smooth user experiences that keep your customers engaged and coming back.',
        features: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Usability Testing'],
        price: 1800, duration: '3-6 weeks', isActive: true, popular: false
      },
      {
        id: '4', sImg: `${BASE_URL}/services/service_image_4.webp`,
        title: 'Cloud Solutions', slug: 'cloud-solutions',
        thumb1: `${BASE_URL}/services/service_details_image_2.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_3.webp`,
        col: 'col-lg-4',
        description: 'Scalable cloud infrastructure and deployment solutions. We help businesses migrate to the cloud, optimize their architecture, and ensure maximum uptime and performance.',
        features: ['AWS / Azure / GCP', 'CI/CD Pipelines', 'Auto Scaling', 'Monitoring & Alerts', 'Cost Optimization'],
        price: 3500, duration: '6-12 weeks', isActive: true, popular: true
      },
      {
        id: '5', sImg: `${BASE_URL}/services/service_image_5.webp`,
        title: 'Cybersecurity', slug: 'cybersecurity',
        thumb1: `${BASE_URL}/services/service_details_image_4.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_5.webp`,
        col: 'col-lg-4',
        description: 'Comprehensive security solutions to protect your digital assets. From penetration testing to security audits, we ensure your systems are fortified against modern threats.',
        features: ['Penetration Testing', 'Security Audits', 'Threat Detection', 'Compliance (GDPR/HIPAA)', 'Incident Response'],
        price: 4000, duration: '4-10 weeks', isActive: true, popular: false
      },
      {
        id: '6', sImg: `${BASE_URL}/services/service_image_6.webp`,
        title: 'Data Analytics & AI', slug: 'data-analytics-ai',
        thumb1: `${BASE_URL}/services/service_details_image_1.webp`,
        thumb2: `${BASE_URL}/services/service_details_image_4.webp`,
        col: 'col-lg-4',
        description: 'Unlock the power of your data with advanced analytics and artificial intelligence solutions. We build custom ML models and data pipelines that drive smarter business decisions.',
        features: ['Machine Learning', 'Data Visualization', 'Predictive Analytics', 'NLP Solutions', 'Big Data Processing'],
        price: 6000, duration: '8-20 weeks', isActive: true, popular: true
      },
    ];

    for (const s of services) {
      await pool.query(
        `INSERT INTO services (service_id, s_img, title, slug, thumb1, thumb2, col, description, features, price, duration, is_active, popular)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (service_id) DO NOTHING`,
        [s.id, s.sImg, s.title, s.slug, s.thumb1, s.thumb2, s.col, s.description, s.features, s.price, s.duration, s.isActive, s.popular]
      );
    }
    console.log(`  ✅ ${services.length} services inserted`);

    // ============================================================
    // 2. SEED PROJECTS
    // ============================================================
    console.log('Seeding projects...');
    const projects = [
      {
        id: '1', pImg: `${BASE_URL}/portfolio/portfolio_item_image_1.webp`,
        title: 'E-Commerce Platform', slug: 'e-commerce-platform',
        sub: 'Full-Stack Development', description: 'A comprehensive e-commerce platform built with React and Node.js featuring real-time inventory management, secure payment processing, and an intuitive admin dashboard. Designed for high traffic and scalability.',
        industry: 'Retail', country: 'United States',
        technologies1: 'React, Node.js, PostgreSQL', technologies2: 'AWS, Stripe, Redis',
        thumb1: `${BASE_URL}/case/case_image_1.webp`, thumb2: `${BASE_URL}/case/case_image_2.webp`,
        category: 'web', status: 'completed', featured: true
      },
      {
        id: '2', pImg: `${BASE_URL}/portfolio/portfolio_item_image_2.webp`,
        title: 'Healthcare Management System', slug: 'healthcare-management-system',
        sub: 'Enterprise Software', description: 'A HIPAA-compliant healthcare management system enabling hospitals to manage patient records, appointments, and billing. Includes telemedicine integration and real-time analytics dashboards.',
        industry: 'Healthcare', country: 'United Kingdom',
        technologies1: 'Angular, .NET Core', technologies2: 'Azure, SQL Server',
        thumb1: `${BASE_URL}/case/case_image_3.webp`, thumb2: `${BASE_URL}/case/case_image_4.webp`,
        category: 'enterprise', status: 'completed', featured: true
      },
      {
        id: '3', pImg: `${BASE_URL}/portfolio/portfolio_item_image_3.webp`,
        title: 'Fintech Mobile App', slug: 'fintech-mobile-app',
        sub: 'Mobile Development', description: 'A secure mobile banking application with biometric authentication, real-time transaction tracking, budgeting tools, and peer-to-peer payment capabilities. Available on both iOS and Android platforms.',
        industry: 'Finance', country: 'Germany',
        technologies1: 'React Native, Python', technologies2: 'Firebase, AWS Lambda',
        thumb1: `${BASE_URL}/case/case_image_1.webp`, thumb2: `${BASE_URL}/case/case_image_3.webp`,
        category: 'mobile', status: 'completed', featured: true
      },
      {
        id: '4', pImg: `${BASE_URL}/portfolio/portfolio_item_image_5.webp`,
        title: 'Smart Logistics Dashboard', slug: 'smart-logistics-dashboard',
        sub: 'Data Analytics', description: 'An intelligent logistics dashboard with real-time fleet tracking, route optimization, and predictive maintenance alerts. Helps companies reduce delivery times by 35% and operational costs by 20%.',
        industry: 'Logistics', country: 'UAE',
        technologies1: 'Vue.js, Django', technologies2: 'GCP, TensorFlow',
        thumb1: `${BASE_URL}/case/case_image_2.webp`, thumb2: `${BASE_URL}/case/case_image_4.webp`,
        category: 'analytics', status: 'completed', featured: true
      },
      {
        id: '5', pImg: `${BASE_URL}/portfolio/portfolio_item_image_6.webp`,
        title: 'Real Estate Platform', slug: 'real-estate-platform',
        sub: 'Web Application', description: 'A modern real estate listing platform with virtual tours, AI-powered property recommendations, mortgage calculators, and integrated CRM for real estate agents.',
        industry: 'Real Estate', country: 'Canada',
        technologies1: 'Next.js, Express', technologies2: 'MongoDB, Mapbox',
        thumb1: `${BASE_URL}/case/case_image_3.webp`, thumb2: `${BASE_URL}/case/case_image_1.webp`,
        category: 'web', status: 'completed', featured: false
      },
      {
        id: '6', pImg: `${BASE_URL}/portfolio/portfolio_item_image_1.webp`,
        title: 'EdTech Learning Platform', slug: 'edtech-learning-platform',
        sub: 'Education Technology', description: 'An interactive online learning platform with live video classes, gamified quizzes, progress tracking, and AI-powered personalized learning paths for students of all ages.',
        industry: 'Education', country: 'Australia',
        technologies1: 'React, FastAPI', technologies2: 'PostgreSQL, WebRTC',
        thumb1: `${BASE_URL}/case/case_image_4.webp`, thumb2: `${BASE_URL}/case/case_image_2.webp`,
        category: 'web', status: 'in-progress', featured: false
      },
    ];

    for (const p of projects) {
      await pool.query(
        `INSERT INTO projects (project_id, p_img, title, slug, sub, description, industry, country, technologies1, technologies2, thumb1, thumb2, category, status, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (project_id) DO NOTHING`,
        [p.id, p.pImg, p.title, p.slug, p.sub, p.description, p.industry, p.country, p.technologies1, p.technologies2, p.thumb1, p.thumb2, p.category, p.status, p.featured]
      );
    }
    console.log(`  ✅ ${projects.length} projects inserted`);

    // ============================================================
    // 3. SEED BLOGS
    // ============================================================
    console.log('Seeding blogs...');
    const blogs = [
      {
        id: '1', title: 'The Future of Web Development in 2026', slug: 'future-web-development-2026',
        screens: `${BASE_URL}/blog/blog_post_image_1.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_8.webp`,
        description: 'Explore the latest trends shaping web development in 2026, from AI-driven development tools to edge computing and WebAssembly. Learn how these technologies are transforming how we build modern web applications.',
        author: 'Ahmed Hassan', authorTitle: 'Senior Developer',
        create_at: 'January 15, 2026', comment: '12', thumb: 'Technology',
        blClass: 'format-standard-image', views: 245, isPublished: true
      },
      {
        id: '2', title: 'Building Scalable Microservices with Node.js', slug: 'scalable-microservices-nodejs',
        screens: `${BASE_URL}/blog/blog_post_image_2.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_9.webp`,
        description: 'A comprehensive guide to designing and implementing microservices architecture using Node.js. Cover service discovery, API gateways, inter-service communication, and deployment strategies.',
        author: 'Sara Ali', authorTitle: 'Backend Architect',
        create_at: 'February 8, 2026', comment: '8', thumb: 'Development',
        blClass: 'format-standard-image', views: 189, isPublished: true
      },
      {
        id: '3', title: 'Cybersecurity Best Practices for Startups', slug: 'cybersecurity-best-practices-startups',
        screens: `${BASE_URL}/blog/blog_post_image_3.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_10.webp`,
        description: 'Essential cybersecurity measures every startup should implement from day one. From secure coding practices to incident response planning, protect your business without breaking the bank.',
        author: 'Omar Khaled', authorTitle: 'Security Engineer',
        create_at: 'March 1, 2026', comment: '15', thumb: 'Security',
        blClass: 'format-standard-image', views: 312, isPublished: true
      },
      {
        id: '4', title: 'AI-Powered UX: Designing Smarter Interfaces', slug: 'ai-powered-ux-design',
        screens: `${BASE_URL}/blog/blog_post_image_4.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_11.webp`,
        description: 'How artificial intelligence is revolutionizing UX design. Discover tools and techniques for creating adaptive interfaces that learn from user behavior and deliver personalized experiences.',
        author: 'Fatima Noor', authorTitle: 'UX Design Lead',
        create_at: 'March 20, 2026', comment: '6', thumb: 'Design',
        blClass: 'format-standard-image', views: 178, isPublished: true
      },
      {
        id: '5', title: 'Cloud Migration: A Step-by-Step Guide', slug: 'cloud-migration-guide',
        screens: `${BASE_URL}/blog/blog_post_image_2.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_12.webp`,
        description: 'A practical, step-by-step guide to migrating your on-premise infrastructure to the cloud. Covers assessment, planning, execution, and optimization phases with real-world examples.',
        author: 'Mohammed Youssef', authorTitle: 'Cloud Architect',
        create_at: 'April 5, 2026', comment: '10', thumb: 'Cloud',
        blClass: 'format-standard-image', views: 267, isPublished: true
      },
      {
        id: '6', title: 'React vs Next.js: Which to Choose in 2026?', slug: 'react-vs-nextjs-2026',
        screens: `${BASE_URL}/blog/blog_post_image_1.webp`, bSingle: `${BASE_URL}/blog/blog_post_image_8.webp`,
        description: 'An in-depth comparison between React and Next.js for modern web projects. We analyze performance, SEO capabilities, developer experience, and use cases to help you make the right choice.',
        author: 'Ahmed Hassan', authorTitle: 'Senior Developer',
        create_at: 'April 18, 2026', comment: '22', thumb: 'Technology',
        blClass: 'format-standard-image', views: 456, isPublished: true
      },
    ];

    for (const b of blogs) {
      await pool.query(
        `INSERT INTO blogs (blog_id, title, slug, screens, b_single, description, author, author_title, create_at, comment, thumb, bl_class, views, is_published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (blog_id) DO NOTHING`,
        [b.id, b.title, b.slug, b.screens, b.bSingle, b.description, b.author, b.authorTitle, b.create_at, b.comment, b.thumb, b.blClass, b.views, b.isPublished]
      );
    }
    console.log(`  ✅ ${blogs.length} blogs inserted`);

    // ============================================================
    // 4. SEED TEAM MEMBERS
    // ============================================================
    console.log('Seeding team members...');
    const teamMembers = [
      {
        id: '1', tImg: `${BASE_URL}/team/team_member_image_1.webp`,
        name: 'Ahmed Hassan', slug: 'ahmed-hassan', title: 'CEO & Founder',
        email: 'ahmed@devnitycode.com', phone: '+964 770 123 4567',
        bio: 'Visionary tech leader with 12+ years of experience in software engineering and business strategy. Founded DevnityCode with a mission to deliver world-class digital solutions.',
        socialLinks: { linkedin: 'https://linkedin.com/in/ahmed-hassan', twitter: 'https://twitter.com/ahmed_dev', github: 'https://github.com/ahmedhassan', website: 'https://devnitycode.com' },
        skills: ['Leadership', 'Strategy', 'Full-Stack Development', 'Cloud Architecture'],
        experience: 12, isActive: true
      },
      {
        id: '2', tImg: `${BASE_URL}/team/team_member_image_2.webp`,
        name: 'Sara Ali', slug: 'sara-ali', title: 'CTO',
        email: 'sara@devnitycode.com', phone: '+964 770 234 5678',
        bio: 'Expert backend architect specializing in distributed systems and cloud-native applications. Passionate about building scalable, resilient systems that handle millions of requests.',
        socialLinks: { linkedin: 'https://linkedin.com/in/sara-ali', twitter: '', github: 'https://github.com/sara-ali', website: '' },
        skills: ['Node.js', 'Python', 'Microservices', 'AWS', 'System Design'],
        experience: 10, isActive: true
      },
      {
        id: '3', tImg: `${BASE_URL}/team/team_member_image_3.webp`,
        name: 'Omar Khaled', slug: 'omar-khaled', title: 'Lead Frontend Developer',
        email: 'omar@devnitycode.com', phone: '+964 770 345 6789',
        bio: 'Creative frontend developer with a keen eye for design and performance. Specializes in building beautiful, accessible, and blazing-fast user interfaces with React and Next.js.',
        socialLinks: { linkedin: 'https://linkedin.com/in/omar-khaled', twitter: '', github: 'https://github.com/omarkhaled', website: '' },
        skills: ['React', 'Next.js', 'TypeScript', 'CSS/Sass', 'Performance Optimization'],
        experience: 7, isActive: true
      },
      {
        id: '4', tImg: `${BASE_URL}/team/team_member_image_4.webp`,
        name: 'Fatima Noor', slug: 'fatima-noor', title: 'UI/UX Design Lead',
        email: 'fatima@devnitycode.com', phone: '+964 770 456 7890',
        bio: 'Award-winning UI/UX designer who transforms complex problems into elegant, user-friendly solutions. Advocates for human-centered design and inclusive digital experiences.',
        socialLinks: { linkedin: 'https://linkedin.com/in/fatima-noor', twitter: '', github: '', website: 'https://fatimanoor.design' },
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
        experience: 8, isActive: true
      },
      {
        id: '5', tImg: `${BASE_URL}/team/team_member_image_5.webp`,
        name: 'Mohammed Youssef', slug: 'mohammed-youssef', title: 'DevOps Engineer',
        email: 'mohammed@devnitycode.com', phone: '+964 770 567 8901',
        bio: 'Infrastructure and automation expert who ensures smooth deployments and rock-solid reliability. Builds and maintains CI/CD pipelines that power our development workflow.',
        socialLinks: { linkedin: 'https://linkedin.com/in/mohammed-youssef', twitter: '', github: 'https://github.com/myoussef', website: '' },
        skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Monitoring'],
        experience: 6, isActive: true
      },
    ];

    for (const t of teamMembers) {
      const sl = t.socialLinks;
      await pool.query(
        `INSERT INTO teams (team_id, t_img, name, slug, title, email, phone, bio, social_linkedin, social_twitter, social_github, social_website, skills, experience, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (team_id) DO NOTHING`,
        [t.id, t.tImg, t.name, t.slug, t.title, t.email, t.phone, t.bio, sl.linkedin, sl.twitter, sl.github, sl.website, t.skills, t.experience, t.isActive]
      );
    }
    console.log(`  ✅ ${teamMembers.length} team members inserted`);

    // ============================================================
    // DONE
    // ============================================================
    console.log('\n🎉 All seed data inserted successfully!');

    // Verify counts
    const counts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM services'),
      pool.query('SELECT COUNT(*) FROM projects'),
      pool.query('SELECT COUNT(*) FROM blogs'),
      pool.query('SELECT COUNT(*) FROM teams'),
      pool.query('SELECT COUNT(*) FROM contacts'),
    ]);

    console.log('\nDatabase summary:');
    console.log(`  Services:  ${counts[0].rows[0].count}`);
    console.log(`  Projects:  ${counts[1].rows[0].count}`);
    console.log(`  Blogs:     ${counts[2].rows[0].count}`);
    console.log(`  Teams:     ${counts[3].rows[0].count}`);
    console.log(`  Contacts:  ${counts[4].rows[0].count}`);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

seedData();
