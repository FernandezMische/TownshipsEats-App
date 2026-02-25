import VendorModel from '../models/vendorModel.js';

export const getVendors = async (req, res) => {
  try {
    const vendors = await VendorModel.getAllActive();
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await VendorModel.getById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    const menu = await VendorModel.getMenu(vendor.id);
    res.json({
      success: true,
      data: {
        ...vendor,
        menu
      }
    });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
