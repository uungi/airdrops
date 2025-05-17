import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-800 text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center font-bold text-xl text-white mb-3">
              <i className="fas fa-parachute-box mr-2"></i>
              <span>Airdrops Hunter</span>
            </Link>
            <p className="text-sm">
              Discover the best crypto airdrops, track opportunities, and never miss free tokens. 
              Airdrops Hunter is your go-to platform for crypto airdrop hunting.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/airdrops" className="text-sm hover:text-white transition">
                  All Airdrops
                </Link>
              </li>
              <li>
                <Link href="/upcoming" className="text-sm hover:text-white transition">
                  Upcoming
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-sm hover:text-white transition">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/notion-setup" className="text-sm hover:text-white transition">
                  Notion Setup
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-3">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {currentYear} Airdrops Hunter. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="text-neutral-400 hover:text-white">
              <i className="fab fa-telegram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
