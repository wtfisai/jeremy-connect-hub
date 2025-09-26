import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
              <p>Jeremy Williams provides professional consulting services in:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Supply chain operations management</li>
                <li>Technology consulting and implementation</li>
                <li>Brand development and strategy</li>
                <li>Business process optimization</li>
              </ul>
              <p>Services are provided on a consulting basis and may include strategic advice, implementation guidance, and ongoing support.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Consulting Services Terms</h2>
              <p>When engaging our consulting services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All consulting agreements will be documented in separate service agreements</li>
                <li>Payment terms will be specified in individual contracts</li>
                <li>Confidentiality agreements may apply to protect sensitive business information</li>
                <li>Deliverables and timelines will be mutually agreed upon</li>
                <li>Either party may terminate services with appropriate notice as specified in service agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p>The materials on this website are protected by applicable copyright and trademark law. All intellectual property rights in consulting deliverables will be addressed in individual service agreements.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
              <p>The materials on this website are provided on an 'as is' basis. Jeremy Williams makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Professional Liability</h2>
              <p>While we strive to provide accurate and valuable consulting services, business decisions and implementations are ultimately the responsibility of the client. Our consulting services are provided as professional opinions and recommendations based on our expertise and experience.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
              <p>In no event shall Jeremy Williams or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website or consulting services, even if Jeremy Williams or authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Accuracy of Materials</h2>
              <p>The materials appearing on this website could include technical, typographical, or photographic errors. Jeremy Williams does not warrant that any of the materials on its website are accurate, complete, or current. Jeremy Williams may make changes to the materials contained on its website at any time without notice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Links</h2>
              <p>Jeremy Williams has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Jeremy Williams of the site. Use of any such linked website is at the user's own risk.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
              <p>Jeremy Williams may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of [Your State/Country] and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <p className="mt-4">
                <strong>Jeremy Williams</strong><br />
                Email: jeremy@dobeu.net<br />
                Phone: +1 (555) 123-4567
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;