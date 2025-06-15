
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Edit, Phone, MapPin, Eye } from 'lucide-react';
import { Customer } from '@/types/types';
import { toast } from '@/hooks/use-toast';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onEditCustomer: (id: string, customer: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const Customers: React.FC<CustomersProps> = ({ customers, onAddCustomer, onEditCustomer }) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactNumber.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate names (case insensitive)
    const existingCustomer = customers.find(
      customer => customer.name.toLowerCase() === formData.name.toLowerCase() &&
      (!editingCustomer || customer.id !== editingCustomer.id)
    );
    
    if (existingCustomer) {
      toast({
        title: "Customer already exists",
        description: "A customer with this name is already registered.",
        variant: "destructive"
      });
      return;
    }

    if (editingCustomer) {
      onEditCustomer(editingCustomer.id, formData);
      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully."
      });
    } else {
      onAddCustomer(formData);
      toast({
        title: "Customer registered",
        description: "New customer has been registered successfully."
      });
    }

    setFormData({ name: '', address: '', contactNumber: '' });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address,
      contactNumber: customer.contactNumber
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ name: '', address: '', contactNumber: '' });
    setIsDialogOpen(true);
  };

  const handleViewProfile = (customer: Customer) => {
    navigate(`/customers/${customer.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search customers by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{filteredCustomers.length} customers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProfile(customer)}
                    className="h-8 w-8 p-0"
                    title="View Profile"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                    className="h-8 w-8 p-0"
                    title="Edit Customer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{customer.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{customer.contactNumber}</span>
              </div>
              <div className="text-xs text-gray-500 pt-2">
                Registered: {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => handleViewProfile(customer)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No customers match your search.' : 'Get started by adding your first customer.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingCustomer ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
