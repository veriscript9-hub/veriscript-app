/**
 * VeriScript Admin - Ad Management
 */

let currentEditingAdId = null;

// Check admin auth on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await utils.checkAuth('/admin/login.html');
    
    // Check if user is admin
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      utils.showToast('Access denied. Admin privileges required.', 'error');
      setTimeout(() => window.location.href = '/', 2000);
      return;
    }
    
    // Load ads
    await loadAds();
    await loadStats();
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Error:', error);
    utils.showToast('Error loading admin panel', 'error');
  }
});

// Setup event listeners
function setupEventListeners() {
  // Character count for ad text
  document.getElementById('adText').addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('charCount').textContent = `${count} / 200 characters`;
    updatePreview();
  });
  
  // Color pickers
  document.getElementById('backgroundColor').addEventListener('input', (e) => {
    document.getElementById('backgroundColorText').value = e.target.value;
    updatePreview();
  });
  
  document.getElementById('backgroundColorText').addEventListener('input', (e) => {
    document.getElementById('backgroundColor').value = e.target.value;
    updatePreview();
  });
  
  document.getElementById('textColor').addEventListener('input', (e) => {
    document.getElementById('textColorText').value = e.target.value;
    updatePreview();
  });
  
  document.getElementById('textColorText').addEventListener('input', (e) => {
    document.getElementById('textColor').value = e.target.value;
    updatePreview();
  });
  
  // Form submission
  document.getElementById('adForm').addEventListener('submit', handleAdSubmit);
}

// Load ads
async function loadAds() {
  try {
    utils.showLoader();
    
    const statusFilter = document.getElementById('statusFilter').value;
    const portalFilter = document.getElementById('portalFilter').value;
    
    let query = db.collection('ads');
    
    // Apply filters
    if (statusFilter !== 'all') {
      query = query.where('status', '==', statusFilter);
    }
    
    if (portalFilter !== 'all') {
      query = query.where('targetPortals', 'array-contains', portalFilter);
    }
    
    // Order by priority
    query = query.orderBy('priority', 'desc');
    
    const snapshot = await query.get();
    
    const adsTable = document.getElementById('adsTable');
    
    if (snapshot.empty) {
      adsTable.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-500);">
            No ads found. Create your first ad!
          </td>
        </tr>
      `;
      return;
    }
    
    let html = '';
    
    snapshot.forEach(doc => {
      const ad = doc.data();
      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
      const revenue = ad.spend || 0;
      
      // Check if expired
      const now = new Date();
      const endDate = ad.endDate.toDate();
      const isExpired = endDate < now;
      
      let statusBadge = '';
      if (isExpired) {
        statusBadge = '<span class="badge badge-error">Expired</span>';
      } else if (ad.status === 'active') {
        statusBadge = '<span class="badge badge-success">Active</span>';
      } else {
        statusBadge = '<span class="badge badge-warning">Paused</span>';
      }
      
      html += `
        <tr>
          <td>
            <div class="ad-preview" style="background: ${ad.backgroundColor}; color: ${ad.textColor};">
              ${ad.text.substring(0, 50)}${ad.text.length > 50 ? '...' : ''}
            </div>
          </td>
          <td>
            ${ad.targetPortals.map(p => `<span class="badge badge-info">${p}</span>`).join(' ')}
          </td>
          <td>${statusBadge}</td>
          <td>${utils.formatNumber(ad.impressions || 0)}</td>
          <td>${utils.formatNumber(ad.clicks || 0)}</td>
          <td>${ctr}%</td>
          <td>₹${utils.formatNumber(revenue)}</td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" onclick="editAd('${doc.id}')" title="Edit">
                ✏️
              </button>
              <button class="btn btn-sm btn-outline" onclick="toggleAdStatus('${doc.id}', '${ad.status}')" title="${ad.status === 'active' ? 'Pause' : 'Activate'}">
                ${ad.status === 'active' ? '⏸️' : '▶️'}
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteAd('${doc.id}')" title="Delete">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    
    adsTable.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading ads:', error);
    utils.showToast('Error loading ads', 'error');
  } finally {
    utils.hideLoader();
  }
}

// Load stats
async function loadStats() {
  try {
    const snapshot = await db.collection('ads').get();
    
    let totalAds = 0;
    let activeAds = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalRevenue = 0;
    
    snapshot.forEach(doc => {
      const ad = doc.data();
      totalAds++;
      
      if (ad.status === 'active') {
        activeAds++;
      }
      
      totalImpressions += ad.impressions || 0;
      totalClicks += ad.clicks || 0;
      totalRevenue += ad.spend || 0;
    });
    
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    
    document.getElementById('totalAds').textContent = totalAds;
    document.getElementById('activeAds').textContent = activeAds;
    document.getElementById('totalImpressions').textContent = utils.formatNumber(totalImpressions);
    document.getElementById('totalClicks').textContent = utils.formatNumber(totalClicks);
    document.getElementById('avgCTR').textContent = avgCTR + '%';
    document.getElementById('totalRevenue').textContent = '₹' + utils.formatNumber(totalRevenue);
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Open create ad modal
function openCreateAdModal() {
  currentEditingAdId = null;
  document.getElementById('modalTitle').textContent = 'Create New Ad';
  document.getElementById('submitButtonText').textContent = 'Create Ad';
  document.getElementById('adForm').reset();
  
  // Set default dates
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // 3 months from now
  
  document.getElementById('startDate').value = now.toISOString().slice(0, 16);
  document.getElementById('endDate').value = endDate.toISOString().slice(0, 16);
  
  updatePreview();
  document.getElementById('adModal').classList.add('active');
}

// Edit ad
async function editAd(adId) {
  try {
    utils.showLoader();
    
    const doc = await db.collection('ads').doc(adId).get();
    
    if (!doc.exists) {
      utils.showToast('Ad not found', 'error');
      return;
    }
    
    const ad = doc.data();
    currentEditingAdId = adId;
    
    // Populate form
    document.getElementById('modalTitle').textContent = 'Edit Ad';
    document.getElementById('submitButtonText').textContent = 'Update Ad';
    
    document.getElementById('adText').value = ad.text;
    document.getElementById('adLink').value = ad.link || '';
    
    // Portals
    document.getElementById('portalDoctor').checked = ad.targetPortals.includes('doctor');
    document.getElementById('portalChemist').checked = ad.targetPortals.includes('chemist');
    document.getElementById('portalPatient').checked = ad.targetPortals.includes('patient');
    
    // Dates
    document.getElementById('startDate').value = ad.startDate.toDate().toISOString().slice(0, 16);
    document.getElementById('endDate').value = ad.endDate.toDate().toISOString().slice(0, 16);
    
    // Styling
    document.getElementById('backgroundColor').value = ad.backgroundColor;
    document.getElementById('backgroundColorText').value = ad.backgroundColor;
    document.getElementById('textColor').value = ad.textColor;
    document.getElementById('textColorText').value = ad.textColor;
    document.getElementById('variant').value = ad.variant || 'primary';
    
    // Budget
    document.getElementById('priority').value = ad.priority || 5;
    document.getElementById('dailyBudget').value = ad.dailyBudget || 1000;
    document.getElementById('costPerImpression').value = ad.costPerImpression || 0.50;
    document.getElementById('costPerClick').value = ad.costPerClick || 5.00;
    
    updatePreview();
    document.getElementById('adModal').classList.add('active');
    
  } catch (error) {
    console.error('Error loading ad:', error);
    utils.showToast('Error loading ad', 'error');
  } finally {
    utils.hideLoader();
  }
}

// Handle ad form submission
async function handleAdSubmit(e) {
  e.preventDefault();
  
  try {
    utils.showLoader();
    
    // Get form data
    const text = document.getElementById('adText').value;
    const link = document.getElementById('adLink').value;
    
    // Get target portals
    const targetPortals = [];
    if (document.getElementById('portalDoctor').checked) targetPortals.push('doctor');
    if (document.getElementById('portalChemist').checked) targetPortals.push('chemist');
    if (document.getElementById('portalPatient').checked) targetPortals.push('patient');
    
    if (targetPortals.length === 0) {
      utils.showToast('Please select at least one target portal', 'error');
      return;
    }
    
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    if (endDate <= startDate) {
      utils.showToast('End date must be after start date', 'error');
      return;
    }
    
    const adData = {
      text,
      link: link || null,
      targetPortals,
      startDate: firebase.firestore.Timestamp.fromDate(startDate),
      endDate: firebase.firestore.Timestamp.fromDate(endDate),
      status: 'active',
      backgroundColor: document.getElementById('backgroundColor').value,
      textColor: document.getElementById('textColor').value,
      variant: document.getElementById('variant').value,
      priority: parseInt(document.getElementById('priority').value),
      dailyBudget: parseFloat(document.getElementById('dailyBudget').value),
      costPerImpression: parseFloat(document.getElementById('costPerImpression').value),
      costPerClick: parseFloat(document.getElementById('costPerClick').value),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (currentEditingAdId) {
      // Update existing ad
      await db.collection('ads').doc(currentEditingAdId).update(adData);
      utils.showToast('Ad updated successfully!', 'success');
    } else {
      // Create new ad
      adData.impressions = 0;
      adData.clicks = 0;
      adData.spend = 0;
      adData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      
      await db.collection('ads').add(adData);
      utils.showToast('Ad created successfully!', 'success');
    }
    
    closeModal();
    await loadAds();
    await loadStats();
    
  } catch (error) {
    console.error('Error saving ad:', error);
    utils.showToast('Error saving ad', 'error');
  } finally {
    utils.hideLoader();
  }
}

// Toggle ad status
async function toggleAdStatus(adId, currentStatus) {
  try {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    await db.collection('ads').doc(adId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    utils.showToast(`Ad ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`, 'success');
    await loadAds();
    await loadStats();
    
  } catch (error) {
    console.error('Error toggling ad status:', error);
    utils.showToast('Error updating ad status', 'error');
  }
}

// Delete ad
async function deleteAd(adId) {
  if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
    return;
  }
  
  try {
    utils.showLoader();
    
    await db.collection('ads').doc(adId).delete();
    
    utils.showToast('Ad deleted successfully!', 'success');
    await loadAds();
    await loadStats();
    
  } catch (error) {
    console.error('Error deleting ad:', error);
    utils.showToast('Error deleting ad', 'error');
  } finally {
    utils.hideLoader();
  }
}

// Update preview
function updatePreview() {
  const text = document.getElementById('adText').value || 'Enter ad text to see preview...';
  const backgroundColor = document.getElementById('backgroundColor').value;
  const textColor = document.getElementById('textColor').value;
  
  const preview = document.getElementById('adPreview');
  preview.textContent = text;
  preview.style.background = backgroundColor;
  preview.style.color = textColor;
}

// Close modal
function closeModal() {
  document.getElementById('adModal').classList.remove('active');
  currentEditingAdId = null;
}

// Close modal on outside click
document.getElementById('adModal').addEventListener('click', (e) => {
  if (e.target.id === 'adModal') {
    closeModal();
  }
});
