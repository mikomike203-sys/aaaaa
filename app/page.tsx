// Home Page
import Link from 'next/link';
import { ArrowRight, Shield, CheckCircle, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-[#1f7a5a]">
            Tech Developers KE & EA
          </div>
          <nav className="flex gap-6 items-center">
            <Link href="/how-it-works" className="text-gray-700 hover:text-[#1f7a5a]">
              How It Works
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-[#1f7a5a]">
              Services
            </Link>
            <Link href="/login" className="px-6 py-2 bg-[#1f7a5a] text-white rounded-lg hover:bg-[#176549]">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Development Projects<br />
            <span className="text-[#1f7a5a]">With Escrow Protection</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with verified developers in Kenya & East Africa. Pay only 43% deposit held in escrow.
            110% refund guarantee.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/find-commissioner"
              className="px-8 py-4 bg-[#1f7a5a] text-white rounded-lg text-lg font-semibold hover:bg-[#176549] flex items-center gap-2"
            >
              Find a Commissioner <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-8 py-4 border-2 border-[#1f7a5a] text-[#1f7a5a] rounded-lg text-lg font-semibold hover:bg-[#1f7a5a] hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1f7a5a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Escrow Protected</h3>
              <p className="text-gray-600">
                Your 43% deposit is held securely until work is delivered
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1f7a5a] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">110% Refund Guarantee</h3>
              <p className="text-gray-600">
                If we fail, you receive 110% of your payment back
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1f7a5a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Developers</h3>
              <p className="text-gray-600">
                All developers are KYC-verified and skill-tested
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#1f7a5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h4 className="font-bold mb-2">Find Commissioner</h4>
            <p className="text-sm text-gray-600">Browse verified sales partners</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#1f7a5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h4 className="font-bold mb-2">Pay 43% Deposit</h4>
            <p className="text-sm text-gray-600">Via card, Mpesa, or crypto</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#1f7a5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h4 className="font-bold mb-2">Track Progress</h4>
            <p className="text-sm text-gray-600">Approve milestones as delivered</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#1f7a5a] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h4 className="font-bold mb-2">Final Payment</h4>
            <p className="text-sm text-gray-600">Pay remaining 57% on completion</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Development Services</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              'Web Development',
              'Mobile Apps',
              'Custom CRM',
              'School Portals',
              'Payment Integration',
              'Admin Dashboards',
              'E-commerce',
              'UI/UX Design',
              'DevOps & Cloud',
              'API Development',
              'Database Architecture',
              'QA & Testing'
            ].map((service) => (
              <div key={service} className="bg-white p-6 rounded-lg border hover:border-[#1f7a5a] hover:shadow-lg transition">
                <h4 className="font-semibold text-gray-900">{service}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-[#1f7a5a] mb-4">
            Tech Developers KE & EA
          </div>
          <p className="text-gray-400 mb-4">
            Secure, verified development projects with escrow protection
          </p>
          <div className="flex gap-6 justify-center text-sm">
            <Link href="/terms" className="hover:text-[#1f7a5a]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#1f7a5a]">Privacy</Link>
            <Link href="/refunds" className="hover:text-[#1f7a5a]">Refund Policy</Link>
            <Link href="/contact" className="hover:text-[#1f7a5a]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
