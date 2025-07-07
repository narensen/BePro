'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, User, Tag, ArrowRight, Loader2, ChevronLeft, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase_client';
import { useRouter } from 'next/navigation';

const availableTags = [
  { id: 'AI', name: 'Artificial Intelligence', category: 'Technology' },
  { id: 'ML', name: 'Machine Learning', category: 'Technology' },
  { id: 'DS', name: 'Data Science', category: 'Technology' },
  { id: 'WEB_DEV', name: 'Web Development', category: 'Technology' },
  { id: 'MOBILE_DEV', name: 'Mobile Development', category: 'Technology' },
  { id: 'CLOUD', name: 'Cloud Computing', category: 'Technology' },
  { id: 'CYBER', name: 'Cybersecurity', category: 'Technology' },
  { id: 'UI_UX', name: 'UI/UX Design', category: 'Technology' },
  { id: 'SOFTWARE_ENG', name: 'Software Engineering', category: 'Technology' },
  { id: 'MECH_ENG', name: 'Mechanical Engineering', category: 'Engineering' },
  { id: 'ELEC_ENG', name: 'Electrical Engineering', category: 'Engineering' },
  { id: 'CIVIL_ENG', name: 'Civil Engineering', category: 'Engineering' },
  { id: 'INDUSTRIAL_ENG', name: 'Industrial Engineering', category: 'Engineering' },
  { id: 'AERO_ENG', name: 'Aerospace Engineering', category: 'Engineering' },
  { id: 'BIOTECHNOLOGY', name: 'Biotechnology', category: 'Life Sciences' },
  { id: 'GENETICS', name: 'Genetics', category: 'Life Sciences' },
  { id: 'MEDICINE', name: 'Medicine', category: 'Life Sciences' },
  { id: 'BIOINFORMATICS', name: 'Bioinformatics', category: 'Life Sciences' },
  { id: 'NEUROSCIENCE', name: 'Neuroscience', category: 'Life Sciences' },
  { id: 'PUBLIC_HEALTH', name: 'Public Health', category: 'Life Sciences' },
  { id: 'HEALTHCARE_IT', name: 'Healthcare IT', category: 'Life Sciences' },
  { id: 'FINANCE', name: 'Finance', category: 'Business' },
  { id: 'BUSINESS_ANALYTICS', name: 'Business Analytics', category: 'Business' },
  { id: 'MANAGEMENT', name: 'Management', category: 'Business' },
  { id: 'MARKETING', name: 'Marketing', category: 'Business' },
  { id: 'OPERATIONS', name: 'Operations Management', category: 'Business' },
  { id: 'STATISTICS', name: 'Statistics', category: 'Mathematics' },
  { id: 'SUSTAINABILITY', name: 'Sustainability', category: 'Energy' },
  { id: 'RENEWABLE_ENERGY', name: 'Renewable Energy', category: 'Energy' },
  { id: 'CLIMATE_SCIENCE', name: 'Climate Science', category: 'Energy' },
  { id: 'SPACE_TECH', name: 'Space Technology', category: 'Emerging Tech' },
  { id: 'AUTONOMOUS_VEHICLES', name: 'Autonomous Vehicles', category: 'Emerging Tech' },
  { id: 'SMART_CITIES', name: 'Smart Cities', category: 'Emerging Tech' },
  { id: 'PRODUCT_DEV', name: 'Product Development', category: 'Research' },
  { id: 'INNOVATION', name: 'Innovation Management', category: 'Research' },
  { id: 'BLOCKCHAIN', name: 'Blockchain Technology', category: 'Technology' }
];

export { availableTags };
