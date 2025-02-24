import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';

const EquipmentList = ({ equipment }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Your Approved Equipment</Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Category</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {equipment.map((item) => (
          <TableRow key={item._id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>${item.price}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>{item.category}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

export default EquipmentList; 