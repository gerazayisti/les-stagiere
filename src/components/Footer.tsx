import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D2D5B] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/footer-bg.webp')] bg-cover bg-center opacity-10"></div>
      <div className="relative max-w-7xl mx-auto text-center space-y-8 z-10">
        {/* Call-to-Action section content, removed for brevity as it's not the actual footer */}
        <h2
          className="text-4xl font-extrabold max-w-2xl mx-auto leading-tight"
        >
          Ne manquez jamais les actualités emploi, Prêt à commencer ?
        </h2>
        <div
          className="flex justify-center mt-8"
        >
          <div className="flex w-full max-w-md bg-white rounded-full p-1 shadow-lg">
            <input
              type="email"
              placeholder="Entrez votre e-mail"
              className="flex-grow py-3 px-6 rounded-l-full outline-none text-gray-800"
            />
            <button className="bg-[#00A9FF] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0070BA] transition-colors">S'abonner</button>
          </div>
        </div>

        {/* Footer Navigation & Socials */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-left mt-16 pt-8 border-t border-gray-700">
          <div className="col-span-full md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Les Stagiaires</h3>
            <p className="text-gray-400 text-sm">© 2004 All Rights Reserved by Les Stagiaires</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Chercheurs d'emploi</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/browse-jobs" className="hover:text-[#00A9FF] transition-colors">Parcourir les offres</Link></li>
              <li><Link to="/browse-candidates" className="hover:text-[#00A9FF] transition-colors">Parcourir les candidats</Link></li>
              <li><Link to="/blog-news" className="hover:text-[#00A9FF] transition-colors">Blog & Actualités</Link></li>
              <li><Link to="/faq" className="hover:text-[#00A9FF] transition-colors">Questions fréquentes</Link></li>
              <li><Link to="/job-alerts" className="hover:text-[#00A9FF] transition-colors">Alertes emploi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Employeurs</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/all-employer" className="hover:text-[#00A9FF] transition-colors">Tous les employeurs</Link></li>
              <li><Link to="/browse-job" className="hover:text-[#00A9FF] transition-colors">Parcourir les emplois</Link></li>
              <li><Link to="/job-alert-employer" className="hover:text-[#00A9FF] transition-colors">Alerte emploi</Link></li>
              <li><Link to="/faq-employer" className="hover:text-[#00A9FF] transition-colors">Questions fréquentes</Link></li>
              <li><Link to="/job-packages" className="hover:text-[#00A9FF] transition-colors">Forfaits Emploi</Link></li>
            </ul>
          </div>
          <div className="md:col-span-1 lg:text-right">
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex justify-center md:justify-end gap-4 text-gray-400">
              <a href="#" className="hover:text-[#00A9FF] transition-colors"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-[#00A9FF] transition-colors"><Twitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-[#00A9FF] transition-colors"><Instagram className="w-6 h-6" /></a>
              <a href="#" className="hover:text-[#00A9FF] transition-colors"><Linkedin className="w-6 h-6" /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
