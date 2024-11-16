import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box 
    sx={
      {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }
    }>
      <Container maxWidth="md">
        <Typography variant="h1">
          404
        </Typography>
        <Typography variant='h6'>
          Sorry, we Lost the page your'e looking.
        </Typography>
        <Link to="/auth">
        <Button variant="contained"> Back to Login</Button>
        </Link>
        <img 
        src='/404.png'
        alt=""
        width={500} height={250}
        />
      </Container>
    </Box>
  )
}
export default NotFound;

