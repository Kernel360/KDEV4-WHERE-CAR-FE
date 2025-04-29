import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleCompanyClick = useCallback(() => {
    navigate('/company');
  }, [navigate]);

  return (
    <Button 
      variant="contained" 
      color="primary" 
      onClick={handleCompanyClick}
      startIcon={<InfoIcon />}
    >
      자세히
    </Button>
  );
};

export default DashboardPage; 