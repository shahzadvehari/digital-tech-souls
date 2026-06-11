const fs = require('fs');

const frontendPath = 'apps/frontend/src/app/admin/invoices/page.tsx';
let frontendCode = fs.readFileSync(frontendPath, 'utf8');

// Add states for edit modal
if(!frontendCode.includes('isEditing')) {
  frontendCode = frontendCode.replace(
    'const [search, setSearch] = useState(\'\');',
    `const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<Invoice | null>(null);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);`
  );
}

// Add remove, resend, download, update functions
const newFunctions = `
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      fetchInvoices();
      setOpenDropdown(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResend = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/\${id}/resend\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      alert('Invoice email resent successfully!');
      setOpenDropdown(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = (id: number) => {
    window.open(\`/dashboard/invoices/\${id}\`, '_blank');
    setOpenDropdown(null);
  };

  const handleSaveEdit = async () => {
    if (!isEditing) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/\${isEditing.id}\`, {
        method: 'PATCH',
        headers: { 
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      fetchInvoices();
      setIsEditing(null);
    } catch (error) {
      console.error(error);
    }
  };
`;

if(!frontendCode.includes('handleDelete')) {
  frontendCode = frontendCode.replace(
    'const updateStatus = async',
    newFunctions + '\n  const updateStatus = async'
  );
}

// Ensure MoreVertical icon is imported
if(!frontendCode.includes('MoreVertical')) {
  frontendCode = frontendCode.replace(
    'import { FileText, CheckCircle, XCircle, Clock, Search, ExternalLink } from \'lucide-react\';',
    'import { FileText, CheckCircle, XCircle, Clock, Search, ExternalLink, MoreVertical, Edit, Trash, Download, Mail } from \'lucide-react\';'
  );
}

// Replace the Actions TD
const actionsReplacement = `
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2 items-center relative">
                        {invoice.paymentProof && (
                          <a href={invoice.paymentProof} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold flex items-center gap-1">
                            <ExternalLink className="w-3 h-3"/> Proof
                          </a>
                        )}
                        {invoice.status !== 'PAID' && (
                          <button onClick={() => updateStatus(invoice.id, 'PAID')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors text-xs font-bold whitespace-nowrap">
                            Mark Paid
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === invoice.id ? null : invoice.id)}
                            className="p-1 hover:bg-gray-800 rounded text-gray-400 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5"/>
                          </button>
                          
                          {openDropdown === invoice.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 py-1 flex flex-col text-left">
                              <button onClick={() => { setIsEditing(invoice); setEditData(invoice); setOpenDropdown(null); }} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Edit className="w-4 h-4"/> Edit
                              </button>
                              <button onClick={() => handleResend(invoice.id)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Mail className="w-4 h-4"/> Resend Email
                              </button>
                              <button onClick={() => handleDownload(invoice.id)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Download className="w-4 h-4"/> Download
                              </button>
                              <div className="border-t border-gray-800 my-1"></div>
                              <button onClick={() => handleDelete(invoice.id)} className="px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                                <Trash className="w-4 h-4"/> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>`;

if(!frontendCode.includes('setOpenDropdown(')) {
  // We need to replace the entire actions cell.
  // We'll just replace from `<td className="py-4 text-right">` to the end of the `<tr>`
  frontendCode = frontendCode.replace(/<td className="py-4 text-right">[\s\S]*?<\/td>/, actionsReplacement);
  // Actually wait, since it's a map it will only replace the first one. Let's use a global replace or write a smarter regex
  // Wait, there's only one <td className="py-4 text-right"> inside the map.
  frontendCode = frontendCode.replace(/<td className="py-4 text-right">[\s\S]*?<\/td>/g, actionsReplacement);
}

// Add Modal for Editing
const modalJSX = `
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Invoice</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount</label>
                <input 
                  type="number" 
                  value={editData.totalAmount || ''}
                  onChange={e => setEditData({...editData, totalAmount: parseFloat(e.target.value)})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                <input 
                  type="text" 
                  value={editData.currency || ''}
                  onChange={e => setEditData({...editData, currency: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select 
                  value={editData.status || ''}
                  onChange={e => setEditData({...editData, status: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsEditing(null)}
                className="flex-1 bg-gray-800 text-white rounded-xl py-3 hover:bg-gray-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-500 font-bold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
`;

if(!frontendCode.includes('isEditing && (')) {
  frontendCode = frontendCode.replace('</div>\n    </div>\n  );\n}', modalJSX + '</div>\n    </div>\n  );\n}');
}

fs.writeFileSync(frontendPath, frontendCode);
console.log('Frontend Invoices UI updated successfully!');
