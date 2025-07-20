// Navbar
// /Users/matthewsimon/Projects/EAC/eac/components/navbar.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings, User, Bell } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="ml-4 flex items-center space-x-2">
          <span className="text-xl font-bold text-foreground">EAC</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Financial Dashboard
          </span>
        </div>

        {/* Desktop Navigation */}
        {/* <div className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm">
            Projects
          </Button>
          <Button variant="ghost" size="sm">
            Analytics
          </Button>
          <Button variant="ghost" size="sm">
            Reports
          </Button>
        </div> */}

        {/* Right Side Actions */}
        {/* <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <User className="h-4 w-4" />
          </Button>
        </div> */}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-border">
          <div className="flex flex-col space-y-2 pt-4">
            <Button variant="ghost" size="sm" className="justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              Projects
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              Analytics
            </Button>
            <Button variant="ghost" size="sm" className="justify-start">
              Reports
            </Button>
            <div className="border-t border-border pt-2 mt-2">
              <Button variant="ghost" size="sm" className="justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

