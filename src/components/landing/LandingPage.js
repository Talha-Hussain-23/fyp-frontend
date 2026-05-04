import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GraduationCap = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7M5.176 17.082a11.95 11.95 0 001.828 2.945M18.824 17.082a11.95 11.95 0 01-1.828 2.945" />
  </svg>
);

const UserCheck = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">Smart Recruiter AI</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Home
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Job Listings
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                Recruiter Login
              </Link>
            </div>
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Recruiter AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Revolutionizing recruitment with AI-powered matching. Connect talented candidates with the right opportunities.
            </p>
          </motion.div>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              to="/jobs"
              className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg inline-block"
              style={{ 
                display: 'inline-block', 
                textDecoration: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
            >
              Find a Job (Candidate Portal)
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg inline-block"
              style={{ 
                display: 'inline-block', 
                textDecoration: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Recruiter Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Candidates Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-blue-500"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Candidates</h2>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">CV upload and AI-powered analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">Skill-based evaluation and matching</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">Transparent and fair process</span>
                </li>
              </ul>
              <Link
                to="/jobs"
                className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-300"
                style={{ 
                  textDecoration: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                View Active Job Listings →
              </Link>
            </motion.div>

            {/* For Recruiters Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 border-l-4 border-emerald-500"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Recruiters</h2>
              </div>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">AI resume parsing and screening</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">Pipeline graphs and analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-lg">Comprehensive job management</span>
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-block px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-300"
                style={{ 
                  textDecoration: 'none',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
              >
                Access Recruiter Dashboard →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">
            © 2025 Smart Recruiter AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

