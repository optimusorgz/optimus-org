import { Github, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Quick Links": [
      { name: "Home", path: "/" },
      { name: "Events", path: "/events" },
      { name: "Gallery", path: "/gallery" },
    ],
    "Community": [
      { name: "Join Us", path: "/join-us" },
      { name: "Dashboard", path: "/dashboard" },
    ],
  };

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/company/optimus16/posts/" },
    { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/optimus.orgz/" },
  ];

  return (
    <footer className="bg-card/30 backdrop-blur-md border-t border-border/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">O</span>
              </div>
              <span className="text-xl font-bold text-glow">Optimus</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering the next generation of tech innovators through cutting-edge events, 
              workshops, and collaborative learning experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Block - 13, LPU Campus, Punjab, India</span>
              </div>
              
              <div className="flex items-center space-x-3 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>optimus.orgz@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} Optimus Student Organisation. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Code of Conduct
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
