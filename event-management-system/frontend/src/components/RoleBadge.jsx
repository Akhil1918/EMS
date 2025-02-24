import { Chip } from "@mui/material";

const RoleBadge = ({ role, approved }) => {
  if (role === 'admin') {
    return <Chip label="Administrator" color="error" size="small" />;
  }
  if (role === 'vendor') {
    return approved 
      ? <Chip label="Verified Vendor" color="success" size="small" />
      : <Chip label="Pending Approval" color="warning" size="small" />;
  }
  return <Chip label="Standard User" color="info" size="small" />;
};

export default RoleBadge; 