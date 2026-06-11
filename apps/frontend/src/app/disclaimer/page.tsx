
export default function Disclaimer() {
  return (
    <>
            <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Disclaimer</h1>
        <div className="prose prose-invert prose-blue max-w-none text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">1. General Information</h2>
          <p>The information provided by Digital Tech Souls on our website is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">2. Service Uptime</h2>
          <p>While we strive to provide 99.9% uptime as per our hosting guarantees, Digital Tech Souls is not responsible for any downtime, data loss, or business interruption that occurs as a result of external network issues, unforeseen hardware failures, or scheduled maintenance.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">3. External Links</h2>
          <p>Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with Digital Tech Souls. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>

          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">4. Liability</h2>
          <p>In no event shall Digital Tech Souls be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service.</p>
        </div>
      </div>
    </div>
    </>
  );
}
