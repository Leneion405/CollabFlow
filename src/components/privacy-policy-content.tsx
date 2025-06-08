export const PrivacyPolicyContent = () => {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="font-semibold mb-2">Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">How We Use Your Information</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information to improve our service</li>
        </ul>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">Data Security</h3>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">Third-Party Services</h3>
        <p>We may use third-party services (Google, GitHub) for authentication. These services have their own privacy policies governing the use of your information.</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@collabflow.com</p>
      </section>
    </div>
  );
};
