import React, { useState, useRef, useEffect } from 'react';

export default function AgreementForm() {
  const [formData, setFormData] = useState({
    agreementDate: new Date().toISOString().split('T')[0],
    clientBusinessName: '',
    clientContactName: '',
    clientEmail: '',
    clientPhone: '',
    selectedPackage: '',
    customBuildFee: '',
    customBuildDescription: '',
    selectedRevShare: 'standard',
    selectedMaintenance: '',
    summaryBuild: '',
    summaryPremium: '$0',
    summaryMaintenance: '',
    clientTitle: '',
    acknowledgment: false
  });
  
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef(null);
  const [canvasContext, setCanvasContext] = useState(null);

  const packages = [
    { value: 'starter', label: 'Starter - $1,500', price: 1500, desc: '5-7 pages, mobile-optimized, basic SEO, 30 days support' },
    { value: 'professional', label: 'Professional - $2,500', price: 2500, desc: 'Custom functionality, admin dashboard, advanced SEO, 60 days support' },
    { value: 'enterprise', label: 'Enterprise - $5,000', price: 5000, desc: 'Full custom development, e-commerce, API integration, 90 days support' }
  ];

  const revShareOptions = [
    { value: 'standard', label: '70% FaithFeed / 30% Client', premium: 0, desc: 'Included with build fee' },
    { value: 'enhanced', label: '60% FaithFeed / 40% Client', premium: 500, desc: '+$500 premium' },
    { value: 'partner', label: '50% FaithFeed / 50% Client', premium: 750, desc: '+$750 premium' }
  ];

  const maintenanceOptions = [
    { value: 'monthly', label: 'Monthly Package - $99/month', price: 99, desc: '1 SEO blog post, site updates, affiliate monitoring, reports' },
    { value: 'hourly', label: 'Hourly As-Needed - $65/hour', price: 65, desc: 'Content, updates, maintenance billed per hour as requested' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      setCanvasContext(ctx);
    }
  }, []);

  useEffect(() => {
    // Update summary when selections change
    const pkg = packages.find(p => p.value === formData.selectedPackage);
    const revShare = revShareOptions.find(r => r.value === formData.selectedRevShare);
    const maint = maintenanceOptions.find(m => m.value === formData.selectedMaintenance);
    
    const buildFee = formData.customBuildFee ? parseFloat(formData.customBuildFee) : (pkg?.price || 0);
    const premium = revShare?.premium || 0;
    const maintPrice = maint ? (maint.value === 'monthly' ? '$99/mo' : '$65/hr') : '';

    setFormData(prev => ({
      ...prev,
      summaryBuild: buildFee ? `$${buildFee.toLocaleString()}` : '',
      summaryPremium: `$${premium}`,
      summaryMaintenance: maintPrice
    }));
  }, [formData.selectedPackage, formData.selectedRevShare, formData.selectedMaintenance, formData.customBuildFee]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    canvasContext.beginPath();
    canvasContext.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    canvasContext.lineTo(coords.x, coords.y);
    canvasContext.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      canvasContext.closePath();
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const calculateTotal = () => {
    const pkg = packages.find(p => p.value === formData.selectedPackage);
    const revShare = revShareOptions.find(r => r.value === formData.selectedRevShare);
    const buildFee = formData.customBuildFee ? parseFloat(formData.customBuildFee) : (pkg?.price || 0);
    const premium = revShare?.premium || 0;
    const halfBuild = buildFee / 2;
    return halfBuild + premium;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signature) {
      alert('Please provide your signature');
      return;
    }
    
    if (!formData.acknowledgment) {
      alert('Please acknowledge the terms and conditions');
      return;
    }

    // Generate PDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const margin = 20;
    let y = 20;
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 87, 151);
    doc.text('WEBSITE SERVICES &', margin, y);
    y += 8;
    doc.text('AFFILIATE REVENUE AGREEMENT', margin, y);
    y += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('FaithFeed LLC', margin, y);
    y += 10;
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Agreement Date: ${formData.agreementDate}`, margin, y);
    y += 12;
    
    // Parties
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 87, 151);
    doc.text('PARTIES', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text('Provider: FaithFeed LLC, a Mississippi Limited Liability Company', margin, y);
    y += 6;
    doc.text(`Client: ${formData.clientBusinessName}`, margin, y);
    y += 6;
    doc.text(`Contact: ${formData.clientContactName}`, margin, y);
    y += 6;
    doc.text(`Email: ${formData.clientEmail}  |  Phone: ${formData.clientPhone}`, margin, y);
    y += 12;
    
    // Selected Options
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 87, 151);
    doc.text('SELECTED SERVICES', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    const selectedPkg = packages.find(p => p.value === formData.selectedPackage);
    doc.text(`Website Package: ${selectedPkg?.label || 'Custom'} ${formData.customBuildFee ? `($${formData.customBuildFee})` : ''}`, margin, y);
    y += 6;

    if (formData.customBuildDescription) {
      doc.setFont('helvetica', 'italic');
      const descLines = doc.splitTextToSize(`Services: ${formData.customBuildDescription}`, 170);
      descLines.forEach(line => {
        doc.text(line, margin, y);
        y += 5;
      });
      doc.setFont('helvetica', 'normal');
      y += 2;
    }
    
    const selectedRev = revShareOptions.find(r => r.value === formData.selectedRevShare);
    doc.text(`Revenue Share: ${selectedRev?.label} (${selectedRev?.desc})`, margin, y);
    y += 6;
    
    doc.text('Hosting: $29/month', margin, y);
    y += 6;
    
    const selectedMaint = maintenanceOptions.find(m => m.value === formData.selectedMaintenance);
    doc.text(`Maintenance: ${selectedMaint?.label || 'None selected'}`, margin, y);
    y += 12;
    
    // Investment Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 87, 151);
    doc.text('INVESTMENT SUMMARY', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    doc.text(`Website Build Fee: ${formData.summaryBuild}`, margin, y);
    y += 6;
    doc.text(`Revenue Share Premium: ${formData.summaryPremium}`, margin, y);
    y += 6;
    doc.text('Monthly Hosting: $29/month', margin, y);
    y += 6;
    doc.text(`Monthly Maintenance: ${formData.summaryMaintenance || 'As-needed'}`, margin, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL DUE AT SIGNING: $${calculateTotal().toLocaleString()}`, margin, y);
    y += 15;
    
    // Terms Summary
    doc.setFontSize(12);
    doc.setTextColor(43, 87, 151);
    doc.text('KEY TERMS', margin, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    const terms = [
      '• 12-month minimum term from website launch date',
      '• 30-day written notice required for termination after initial term',
      '• Affiliate links managed by FaithFeed; monthly revenue reports provided',
      '• Client share paid monthly with $25 minimum threshold',
      '• FaithFeed retains ownership of code; Client retains content/branding'
    ];
    
    terms.forEach(term => {
      doc.text(term, margin, y);
      y += 5;
    });
    y += 10;
    
    // Signature
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 87, 151);
    doc.text('CLIENT SIGNATURE', margin, y);
    y += 10;
    
    if (signature) {
      doc.addImage(signature, 'PNG', margin, y, 60, 25);
      y += 30;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text(`Printed Name: ${formData.clientContactName}`, margin, y);
    y += 6;
    doc.text(`Title: ${formData.clientTitle}`, margin, y);
    y += 6;
    doc.text(`Business: ${formData.clientBusinessName}`, margin, y);
    y += 6;
    doc.text(`Date: ${formData.agreementDate}`, margin, y);
    y += 15;
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('FaithFeed LLC | Brandon, Mississippi | (769) 487-5679 | info@faithfeed.ai', margin, 280);
    
    // Save
    doc.save(`FaithFeed_Agreement_${formData.clientBusinessName.replace(/\s+/g, '_')}.pdf`);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Agreement Signed!</h2>
          <p className="text-gray-600 mb-6">Your signed agreement has been downloaded. Please email it to info@faithfeed.ai to complete the process.</p>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Website Services Agreement</h1>
          <p className="text-blue-200">FaithFeed LLC</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Client Information */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Client Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  name="clientBusinessName"
                  value={formData.clientBusinessName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  name="clientContactName"
                  value={formData.clientContactName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Title</label>
                <input
                  type="text"
                  name="clientTitle"
                  value={formData.clientTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Owner, CEO, Manager"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Website Package */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Website Package *</h2>
            <div className="space-y-3">
              {packages.map(pkg => (
                <label key={pkg.value} className={`block p-4 border-2 rounded-lg cursor-pointer transition ${formData.selectedPackage === pkg.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="selectedPackage"
                      value={pkg.value}
                      checked={formData.selectedPackage === pkg.value}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{pkg.label}</div>
                      <div className="text-sm text-gray-500">{pkg.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Build Fee (if different)</label>
              <input
                type="number"
                name="customBuildFee"
                value={formData.customBuildFee}
                onChange={handleInputChange}
                placeholder="Enter custom amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description of Services</label>
              <textarea
                name="customBuildDescription"
                value={formData.customBuildDescription}
                onChange={handleInputChange}
                placeholder="Describe the custom services included in this build..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Revenue Share */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Affiliate Revenue Share *</h2>
            <div className="space-y-3">
              {revShareOptions.map(opt => (
                <label key={opt.value} className={`block p-4 border-2 rounded-lg cursor-pointer transition ${formData.selectedRevShare === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="selectedRevShare"
                      value={opt.value}
                      checked={formData.selectedRevShare === opt.value}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{opt.label}</div>
                      <div className="text-sm text-gray-500">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Maintenance Option</h2>
            <div className="space-y-3">
              {maintenanceOptions.map(opt => (
                <label key={opt.value} className={`block p-4 border-2 rounded-lg cursor-pointer transition ${formData.selectedMaintenance === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="selectedMaintenance"
                      value={opt.value}
                      checked={formData.selectedMaintenance === opt.value}
                      onChange={handleInputChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{opt.label}</div>
                      <div className="text-sm text-gray-500">{opt.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">Hosting ($29/month) is included with all packages.</p>
          </div>

          {/* Investment Summary */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Investment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Website Build Fee:</span>
                <span className="font-semibold">{formData.summaryBuild || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Share Premium:</span>
                <span className="font-semibold">{formData.summaryPremium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Hosting:</span>
                <span className="font-semibold">$29/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Maintenance:</span>
                <span className="font-semibold">{formData.summaryMaintenance || '—'}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-800">Total Due at Signing:</span>
                  <span className="font-bold text-blue-600">${calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">(50% of build fee + revenue share premium)</p>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Your Signature *</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full touch-none cursor-crosshair"
                style={{ maxHeight: '150px' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">Draw your signature above</p>
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear Signature
              </button>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className="p-6 border-b border-gray-100">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="acknowledgment"
                checked={formData.acknowledgment}
                onChange={handleInputChange}
                className="mt-1 mr-3 w-5 h-5"
              />
              <span className="text-sm text-gray-700">
                I have read, understand, and agree to all terms and conditions in this Agreement, including the 12-month minimum term, revenue share structure, and payment terms.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="p-6 bg-gray-50">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Sign & Download Agreement
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Your signed agreement will be downloaded as a PDF
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          <p>FaithFeed LLC | Brandon, Mississippi</p>
          <p>(769) 487-5679 | info@faithfeed.ai</p>
        </div>
      </div>
    </div>
  );
}
