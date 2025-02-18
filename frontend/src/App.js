import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Box, Button, Stack } from '@mui/material';
import AddRestaurant from './components/Restaurant/AddRestaurant';
import AddMenuItem from './components/Menu/AddMenuItem';
// Test
function App() {
  return (
    <Router>
      <Container>
        <Box sx={{ my: 4 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <Button component={Link} to="/" variant="contained">
              Add Restaurant
            </Button>
            <Button component={Link} to="/menu/test" variant="contained">
              Add Menu Item
            </Button>
          </Stack>

          <Routes>
            <Route path="/" element={<AddRestaurant />} />
            <Route path="/menu/:restaurantId" element={<AddMenuItem />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;