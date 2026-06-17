'use client';

import Link from 'next/link';
import { RomanWordmark } from '@/components/roman-wordmark';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-100 dark:bg-gray-900 border-t border-gold-400/20 transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 space-y-12">
        {/* Logo & Description */}
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="mb-6">
              <RomanWordmark compact={false} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Excellence in Science & CET preparation. Personal mentorship, concept focused, result driven.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center border border-gold-400/30 text-gold-400 hover:bg-gold-400/20 transition">
                <Facebook className="size-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center border border-gold-400/30 text-gold-400 hover:bg-gold-400/20 transition">
                <Twitter className="size-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center border border-gold-400/30 text-gold-400 hover:bg-gold-400/20 transition">
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Quick Links</h3>
            <nav className="space-y-3">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Home</Link>
              <Link href="/#batches" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Batches</Link>
              <Link href="/#faculty" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Teachers</Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Contact</Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Login</Link>
            </nav>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Courses</h3>
            <nav className="space-y-3">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">11th Science</Link>
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">12th Science</Link>
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">CET Prep</Link>
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition text-sm">Commerce</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="size-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Main Branch</p>
                  <p>A/2, Room 501/502<br />Sector-20, Turbhe<br />Navi Mumbai - 400703</p>
                </div>
              </div>
              
              <a href="tel:+919172765002" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition">
                <Phone className="size-4" /> +91 9172765002
              </a>
              
              <a href="mailto:Datkhilekunalvijay@gmail.com" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition">
                <Mail className="size-4" /> Datkhilekunalvijay@gmail.com
              </a>
              
              <p className="text-xs text-gray-500 dark:text-gray-500">
                <strong>Hours:</strong><br />Mon-Sat: 9 AM - 8 PM<br />Sun: 10 AM - 7 PM
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gold-400/10" />

        {/* Key Contacts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gold-400/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-gold-400" />
              Nava Dada
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Director</p>
            <a href="tel:+918097724133" className="text-sm text-gold-500 hover:text-gold-600 font-medium">
              +91 8097724133
            </a>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gold-400/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-gold-400" />
              Abhi Dada
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Head of Academics</p>
            <a href="tel:+919096985169" className="text-sm text-gold-500 hover:text-gold-600 font-medium">
              +91 9096985169
            </a>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gold-400/10">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-gold-400" />
              Kunal Datkhile
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Admissions & Tech</p>
            <a href="tel:+919172765002" className="text-sm text-gold-500 hover:text-gold-600 font-medium">
              +91 9172765002
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gold-400/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">© {currentYear} Roman Academy. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition">Privacy Policy</Link>
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 transition">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
