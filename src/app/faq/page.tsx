export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-bold text-primary mb-8 font-script">Frequently Asked Questions</h1>
      
      <div className="space-y-6 text-text/80">
        <div className="border border-secondary/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-secondary mb-2">Do you ship internationally?</h3>
          <p>Currently, we only ship within India. We hope to expand internationally soon!</p>
        </div>

        <div className="border border-secondary/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-secondary mb-2">How do I track my order?</h3>
          <p>Once your order ships, you will receive a tracking link via email and WhatsApp.</p>
        </div>

        <div className="border border-secondary/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-secondary mb-2">Are your materials safe for sensitive skin?</h3>
          <p>Yes, all our clothes are made from high-quality, breathable cotton and organic fabrics that are gentle on baby skin.</p>
        </div>
      </div>
    </div>
  );
}
