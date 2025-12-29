import React from "react";
import { Helmet } from "react-helmet-async";
import "../styles/public.css";

const PrivacyPolicy = () => {
  return (
    <div className="page-container page-animate">
      <Helmet>
        <title>Privacy Policy | StudyPDF Hub</title>
        <meta
          name="description"
          content="Privacy Policy for StudyPDF Hub explaining how user data is handled."
        />
      </Helmet>

      <h1 className="page-title">Privacy Policy</h1>

      <p>
        At StudyPDF Hub, we respect your privacy. We do not collect personal
        information unless you voluntarily provide it.
      </p>

      <p>
        We may use third-party services like Google AdSense which may use cookies
        to show ads based on user visits.
      </p>

      <p>
        By using this website, you consent to our privacy policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
