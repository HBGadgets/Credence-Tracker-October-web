import React from "react";
import { Ghost, Home, ArrowRight } from "lucide-react";
import "./page404.css"; // Import custom CSS file

const Page404 = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ marginTop: '65px' }}>
      <div className="text-center">
        {/* Ghost Animation */}
        <div className="position-relative mb-4">
          <Ghost className="ghost-icon text-primary" />
          <div className="shadow-circle"></div>
        </div>

        {/* Error Message */}
        <h1 className="display-1 fw-bold text-primary">Check Internet Connection</h1>
        <h2 className="fs-3 fw-semibold text-dark">Page Not Found(404)</h2>
        <p className="text-muted mb-4">
          Oops! It seems like you've ventured into uncharted territory. The page
          you're looking for might have moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <a href="/" className="btn btn-primary d-flex align-items-center">
            <Home className="me-2" />
            Back to Home
          </a>
          <a href="/contact" className="btn btn-outline-secondary d-flex align-items-center">
            Contact Support
            <ArrowRight className="ms-2" />
          </a>
        </div>

        {/* Additional Help */}
        <div className="mt-4 text-muted small">
          <p>Need immediate assistance? Email us at  credencetraker@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Page404;
