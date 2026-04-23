import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        {/* City skyline SVG watermark */}
        <div className="footer-cityscape" aria-hidden="true">
          <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
            {/* Buildings silhouette */}
            <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5">
              {/* Left cluster */}
              <rect x="20" y="100" width="40" height="120" />
              <rect x="25" y="110" width="10" height="8" /><rect x="40" y="110" width="10" height="8" />
              <rect x="25" y="125" width="10" height="8" /><rect x="40" y="125" width="10" height="8" />
              <rect x="65" y="70" width="50" height="150" />
              <rect x="70" y="80" width="12" height="10" /><rect x="88" y="80" width="12" height="10" />
              <rect x="70" y="97" width="12" height="10" /><rect x="88" y="97" width="12" height="10" />
              <rect x="70" y="114" width="12" height="10" /><rect x="88" y="114" width="12" height="10" />
              <rect x="70" y="131" width="12" height="10" /><rect x="88" y="131" width="12" height="10" />
              <line x1="90" y1="70" x2="90" y2="55" /><line x1="90" y1="55" x2="90" y2="40" strokeDasharray="3,3"/>
              <rect x="120" y="120" width="30" height="100" />
              <rect x="125" y="130" width="8" height="7" /><rect x="137" y="130" width="8" height="7" />
              <rect x="125" y="143" width="8" height="7" /><rect x="137" y="143" width="8" height="7" />
              <rect x="155" y="85" width="45" height="135" />
              <rect x="160" y="95" width="10" height="9" /><rect x="175" y="95" width="10" height="9" />
              <rect x="160" y="110" width="10" height="9" /><rect x="175" y="110" width="10" height="9" />
              <rect x="160" y="125" width="10" height="9" /><rect x="175" y="125" width="10" height="9" />
              <rect x="160" y="140" width="10" height="9" /><rect x="175" y="140" width="10" height="9" />
              <rect x="205" y="130" width="25" height="90" />
              <rect x="210" y="140" width="6" height="6" /><rect x="220" y="140" width="6" height="6" />
              <rect x="210" y="152" width="6" height="6" /><rect x="220" y="152" width="6" height="6" />
              {/* Center-left cluster */}
              <rect x="250" y="60" width="60" height="160" />
              <rect x="256" y="70" width="13" height="11" /><rect x="274" y="70" width="13" height="11" /><rect x="292" y="70" width="13" height="11" />
              <rect x="256" y="87" width="13" height="11" /><rect x="274" y="87" width="13" height="11" /><rect x="292" y="87" width="13" height="11" />
              <rect x="256" y="104" width="13" height="11" /><rect x="274" y="104" width="13" height="11" /><rect x="292" y="104" width="13" height="11" />
              <rect x="256" y="121" width="13" height="11" /><rect x="274" y="121" width="13" height="11" /><rect x="292" y="121" width="13" height="11" />
              <line x1="280" y1="60" x2="280" y2="30" />
              <rect x="315" y="95" width="35" height="125" />
              <rect x="320" y="105" width="9" height="8" /><rect x="334" y="105" width="9" height="8" />
              <rect x="320" y="119" width="9" height="8" /><rect x="334" y="119" width="9" height="8" />
              <rect x="320" y="133" width="9" height="8" /><rect x="334" y="133" width="9" height="8" />
              {/* Center cluster - tall */}
              <rect x="370" y="20" width="70" height="200" />
              <rect x="378" y="30" width="14" height="13" /><rect x="398" y="30" width="14" height="13" /><rect x="418" y="30" width="14" height="13" />
              <rect x="378" y="50" width="14" height="13" /><rect x="398" y="50" width="14" height="13" /><rect x="418" y="50" width="14" height="13" />
              <rect x="378" y="70" width="14" height="13" /><rect x="398" y="70" width="14" height="13" /><rect x="418" y="70" width="14" height="13" />
              <rect x="378" y="90" width="14" height="13" /><rect x="398" y="90" width="14" height="13" /><rect x="418" y="90" width="14" height="13" />
              <rect x="378" y="110" width="14" height="13" /><rect x="398" y="110" width="14" height="13" /><rect x="418" y="110" width="14" height="13" />
              <rect x="378" y="130" width="14" height="13" /><rect x="398" y="130" width="14" height="13" /><rect x="418" y="130" width="14" height="13" />
              <line x1="405" y1="20" x2="405" y2="0" />
              <rect x="445" y="75" width="40" height="145" />
              <rect x="450" y="85" width="10" height="10" /><rect x="466" y="85" width="10" height="10" />
              <rect x="450" y="101" width="10" height="10" /><rect x="466" y="101" width="10" height="10" />
              <rect x="450" y="117" width="10" height="10" /><rect x="466" y="117" width="10" height="10" />
              <rect x="450" y="133" width="10" height="10" /><rect x="466" y="133" width="10" height="10" />
              {/* Center-right cluster */}
              <rect x="500" y="50" width="55" height="170" />
              <rect x="507" y="60" width="12" height="11" /><rect x="524" y="60" width="12" height="11" /><rect x="541" y="60" width="12" height="11" />
              <rect x="507" y="77" width="12" height="11" /><rect x="524" y="77" width="12" height="11" /><rect x="541" y="77" width="12" height="11" />
              <rect x="507" y="94" width="12" height="11" /><rect x="524" y="94" width="12" height="11" /><rect x="541" y="94" width="12" height="11" />
              <rect x="507" y="111" width="12" height="11" /><rect x="524" y="111" width="12" height="11" /><rect x="541" y="111" width="12" height="11" />
              <rect x="507" y="128" width="12" height="11" /><rect x="524" y="128" width="12" height="11" /><rect x="541" y="128" width="12" height="11" />
              <line x1="527" y1="50" x2="527" y2="25" />
              <rect x="560" y="100" width="32" height="120" />
              <rect x="565" y="110" width="8" height="8" /><rect x="578" y="110" width="8" height="8" />
              <rect x="565" y="124" width="8" height="8" /><rect x="578" y="124" width="8" height="8" />
              <rect x="565" y="138" width="8" height="8" /><rect x="578" y="138" width="8" height="8" />
              {/* Right cluster */}
              <rect x="610" y="65" width="50" height="155" />
              <rect x="617" y="75" width="11" height="10" /><rect x="634" y="75" width="11" height="10" /><rect x="648" y="75" width="11" height="10" />
              <rect x="617" y="91" width="11" height="10" /><rect x="634" y="91" width="11" height="10" /><rect x="648" y="91" width="11" height="10" />
              <rect x="617" y="107" width="11" height="10" /><rect x="634" y="107" width="11" height="10" /><rect x="648" y="107" width="11" height="10" />
              <rect x="617" y="123" width="11" height="10" /><rect x="634" y="123" width="11" height="10" /><rect x="648" y="123" width="11" height="10" />
              <line x1="635" y1="65" x2="635" y2="40" />
              <rect x="665" y="110" width="28" height="110" />
              <rect x="670" y="120" width="7" height="7" /><rect x="681" y="120" width="7" height="7" />
              <rect x="670" y="133" width="7" height="7" /><rect x="681" y="133" width="7" height="7" />
              <rect x="698" y="80" width="45" height="140" />
              <rect x="704" y="90" width="10" height="9" /><rect x="720" y="90" width="10" height="9" /><rect x="733" y="90" width="10" height="9" />
              <rect x="704" y="105" width="10" height="9" /><rect x="720" y="105" width="10" height="9" /><rect x="733" y="105" width="10" height="9" />
              <rect x="704" y="120" width="10" height="9" /><rect x="720" y="120" width="10" height="9" /><rect x="733" y="120" width="10" height="9" />
              <rect x="704" y="135" width="10" height="9" /><rect x="720" y="135" width="10" height="9" /><rect x="733" y="135" width="10" height="9" />
              <line x1="720" y1="80" x2="720" y2="55" />
              <rect x="748" y="115" width="35" height="105" />
              <rect x="753" y="125" width="9" height="8" /><rect x="767" y="125" width="9" height="8" />
              <rect x="753" y="139" width="9" height="8" /><rect x="767" y="139" width="9" height="8" />
              {/* Far right cluster */}
              <rect x="800" y="55" width="55" height="165" />
              <rect x="807" y="65" width="12" height="11" /><rect x="824" y="65" width="12" height="11" /><rect x="841" y="65" width="12" height="11" />
              <rect x="807" y="82" width="12" height="11" /><rect x="824" y="82" width="12" height="11" /><rect x="841" y="82" width="12" height="11" />
              <rect x="807" y="99" width="12" height="11" /><rect x="824" y="99" width="12" height="11" /><rect x="841" y="99" width="12" height="11" />
              <rect x="807" y="116" width="12" height="11" /><rect x="824" y="116" width="12" height="11" /><rect x="841" y="116" width="12" height="11" />
              <rect x="807" y="133" width="12" height="11" /><rect x="824" y="133" width="12" height="11" /><rect x="841" y="133" width="12" height="11" />
              <line x1="827" y1="55" x2="827" y2="30" />
              <rect x="862" y="90" width="40" height="130" />
              <rect x="868" y="100" width="10" height="9" /><rect x="883" y="100" width="10" height="9" />
              <rect x="868" y="115" width="10" height="9" /><rect x="883" y="115" width="10" height="9" />
              <rect x="868" y="130" width="10" height="9" /><rect x="883" y="130" width="10" height="9" />
              <rect x="908" y="120" width="30" height="100" />
              <rect x="913" y="130" width="8" height="7" /><rect x="925" y="130" width="8" height="7" />
              <rect x="913" y="143" width="8" height="7" /><rect x="925" y="143" width="8" height="7" />
              <rect x="944" y="75" width="48" height="145" />
              <rect x="950" y="85" width="11" height="10" /><rect x="966" y="85" width="11" height="10" /><rect x="980" y="85" width="11" height="10" />
              <rect x="950" y="101" width="11" height="10" /><rect x="966" y="101" width="11" height="10" /><rect x="980" y="101" width="11" height="10" />
              <rect x="950" y="117" width="11" height="10" /><rect x="966" y="117" width="11" height="10" /><rect x="980" y="117" width="11" height="10" />
              <rect x="950" y="133" width="11" height="10" /><rect x="966" y="133" width="11" height="10" /><rect x="980" y="133" width="11" height="10" />
              <line x1="968" y1="75" x2="968" y2="45" />
              <rect x="998" y="105" width="35" height="115" />
              <rect x="1003" y="115" width="9" height="9" /><rect x="1017" y="115" width="9" height="9" />
              <rect x="1003" y="130" width="9" height="9" /><rect x="1017" y="130" width="9" height="9" />
              <rect x="1038" y="85" width="42" height="135" />
              <rect x="1044" y="95" width="10" height="9" /><rect x="1059" y="95" width="10" height="9" /><rect x="1073" y="95" width="10" height="9" />
              <rect x="1044" y="110" width="10" height="9" /><rect x="1059" y="110" width="10" height="9" /><rect x="1073" y="110" width="10" height="9" />
              <rect x="1044" y="125" width="10" height="9" /><rect x="1059" y="125" width="10" height="9" /><rect x="1073" y="125" width="10" height="9" />
              <rect x="1085" y="110" width="28" height="110" />
              <rect x="1090" y="120" width="7" height="7" /><rect x="1101" y="120" width="7" height="7" />
              <rect x="1090" y="133" width="7" height="7" /><rect x="1101" y="133" width="7" height="7" />
              <rect x="1118" y="95" width="40" height="125" />
              <rect x="1124" y="105" width="10" height="9" /><rect x="1139" y="105" width="10" height="9" />
              <rect x="1124" y="120" width="10" height="9" /><rect x="1139" y="120" width="10" height="9" />
              <rect x="1160" y="120" width="40" height="100" />
              <rect x="1165" y="130" width="9" height="8" /><rect x="1178" y="130" width="9" height="8" />
              <rect x="1165" y="144" width="9" height="8" /><rect x="1178" y="144" width="9" height="8" />
              {/* Ground line */}
              <line x1="0" y1="220" x2="1200" y2="220" />
              {/* Trees */}
              <circle cx="235" cy="148" r="12" />
              <line x1="235" y1="160" x2="235" y2="175" />
              <circle cx="590" cy="145" r="10" />
              <line x1="590" y1="155" x2="590" y2="168" />
              <circle cx="790" cy="150" r="12" />
              <line x1="790" y1="162" x2="790" y2="178" />
              <circle cx="1110" cy="148" r="11" />
              <line x1="1110" y1="159" x2="1110" y2="174" />
              {/* Sun decorative - center */}
              <circle cx="490" cy="100" r="20" />
              <line x1="490" y1="70" x2="490" y2="60" />
              <line x1="490" y1="130" x2="490" y2="140" />
              <line x1="460" y1="100" x2="450" y2="100" />
              <line x1="520" y1="100" x2="530" y2="100" />
              <line x1="469" y1="79" x2="462" y2="72" />
              <line x1="511" y1="121" x2="518" y2="128" />
              <line x1="511" y1="79" x2="518" y2="72" />
              <line x1="469" y1="121" x2="462" y2="128" />
              {/* Clouds */}
              <path d="M100,50 Q110,35 125,38 Q130,25 148,28 Q165,20 170,35 Q183,30 185,42 Q178,50 100,50 Z" />
              <path d="M850,45 Q862,30 878,33 Q884,18 903,22 Q922,14 927,30 Q941,25 943,38 Q936,47 850,45 Z" />
            </g>
          </svg>
        </div>

        <div className="container">
          <div className="footer-content">
            {/* Column 1: Brand + Contact */}
            <div className="footer-section footer-brand">
              <div className="footer-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="9" fill="#212121"/>
                  <path d="M20 6.5L8.5 17.5V32.5C8.5 33.3284 9.17157 34 10 34H30C30.8284 34 31.5 33.3284 31.5 32.5V17.5L20 6.5Z" fill="white"/>
                  <path d="M13.5 34V18.5L20 25L26.5 18.5V34" stroke="#212121" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="miter"/>
                </svg>
                <span>MANYPROP</span>
              </div>
              <div className="footer-contact-info">
                <p className="footer-contact-label">Contact Us</p>
                <p className="footer-contact-item">Toll Free - 1800 41 99099</p>
                <p className="footer-contact-item">Toll Free - 1800 41 99099</p>
                <p className="footer-contact-label" style={{ marginTop: 10 }}>Email Id :</p>
                <p className="footer-contact-item">service.manyprop@gmail.com</p>
              </div>
            </div>

            {/* Column 2: Our Partners */}
            <div className="footer-section">
              <h4 className="footer-section-title">Our partners</h4>
              <ul className="footer-links">
                <li><Link to="#">Coming Soon</Link></li>
                <li><Link to="#">Coming Soon</Link></li>
                <li><Link to="#">Coming Soon</Link></li>
                <li><Link to="#">Others</Link></li>
              </ul>
            </div>

            {/* Column 3: Our Services */}
            <div className="footer-section">
              <h4 className="footer-section-title">Our Services</h4>
              <ul className="footer-links">
                <li><Link to="/post-property">Sell Property</Link></li>
                <li><Link to="/properties">Verify Property</Link></li>
                <li><Link to="/post-property">Project Advertise</Link></li>
                <li><Link to="#">Others</Link></li>
              </ul>
            </div>

            {/* Column 4: Useful Tools */}
            <div className="footer-section">
              <h4 className="footer-section-title">Useful tools</h4>
              <ul className="footer-links">
                <li><a href="/#tools-section">Emi Calculator</a></li>
                <li><a href="/#tools-section">Area Converter</a></li>
                <li><Link to="/compare">Compare property</Link></li>
                <li><Link to="#">Others</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="social-links">
              <a href="#" className="social-link social-facebook" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="social-link social-twitter" aria-label="X / Twitter"><FaXTwitter /></a>
              <a href="#" className="social-link social-instagram" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-link social-youtube" aria-label="YouTube"><FaYoutube /></a>
            </div>
            <p className="copyright">© 2025 manyprop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;