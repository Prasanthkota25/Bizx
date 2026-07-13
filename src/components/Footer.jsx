import { publicAsset } from '../utils/publicAsset';

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-inner">
        
        <div className="footer-left">
          Version 1.0.7
        </div>

        <div className="footer-center">
          Copyright © 2026 | All Rights Reserved |
          
         

   <span className="footer-logo-text">
            <img src={publicAsset('ics-Logo.png')} alt="ICS Logo" className="footer-logo" 
             style={{ width: "14px", margin: "0 5px" }} />
            Infinite Computer Solutions
          </span>


        </div>

        <div className="footer-right">
          Get your BizX App
          <span className="icons">
            <i className="fa fa-apple"></i>
            <i className="fa fa-android"></i>
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;