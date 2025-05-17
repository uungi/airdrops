import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center font-bold text-xl text-primary">
              <i className="fas fa-parachute-box mr-2"></i>
              <span>Airdrops Hunter</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              href="/airdrops" 
              className={`text-sm font-medium ${isActive('/airdrops') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
            >
              All Airdrops
            </Link>
            <Link 
              href="/upcoming" 
              className={`text-sm font-medium ${isActive('/upcoming') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
            >
              Upcoming
            </Link>
            <Link 
              href="/learn" 
              className={`text-sm font-medium ${isActive('/learn') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
            >
              Learn
            </Link>
            <Link 
              href="/notion-setup" 
              className={`text-sm font-medium ${isActive('/notion-setup') ? 'text-primary' : 'text-neutral-700 hover:text-primary'}`}
            >
              Notion Setup
            </Link>
          </nav>
          
          <Button 
            onClick={toggleMenu} 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 w-full absolute bg-white z-10">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-primary-light/10 text-primary' : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              href="/airdrops" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/airdrops') ? 'bg-primary-light/10 text-primary' : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'}`}
            >
              All Airdrops
            </Link>
            <Link 
              href="/upcoming" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/upcoming') ? 'bg-primary-light/10 text-primary' : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'}`}
            >
              Upcoming
            </Link>
            <Link 
              href="/learn" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/learn') ? 'bg-primary-light/10 text-primary' : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'}`}
            >
              Learn
            </Link>
            <Link 
              href="/notion-setup" 
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/notion-setup') ? 'bg-primary-light/10 text-primary' : 'text-neutral-700 hover:bg-neutral-100 hover:text-primary'}`}
            >
              Notion Setup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
