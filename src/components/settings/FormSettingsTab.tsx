
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Wand2, Settings, FileUp, PenLine } from 'lucide-react';

const FormSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Builder</CardTitle>
          <CardDescription>
            Create and manage custom forms for your portals and websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm">
            The form builder allows you to create custom forms for your homeowners, board members, and vendors.
            You can create various types of forms including work orders, ARC applications, surveys, and more.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/system/form-builder">
                <FileText className="mr-2 h-4 w-4" />
                Open Form Builder
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/system/form-builder?tab=templates">
                <Settings className="mr-2 h-4 w-4" />
                Manage Templates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Form Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <FileUp className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Document uploads with secure storage</span>
              </li>
              <li className="flex items-start">
                <PenLine className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Digital signatures for legal documents</span>
              </li>
              <li className="flex items-start">
                <Wand2 className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Conditional logic for smart forms</span>
              </li>
              <li className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Custom templates for common form types</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/system/form-builder?tab=submissions" className="text-primary hover:underline flex items-center">
                  <span className="mr-2">●</span>
                  View form submissions
                </Link>
              </li>
              <li>
                <Link to="/system/form-builder?newform=true" className="text-primary hover:underline flex items-center">
                  <span className="mr-2">●</span>
                  Create a new form
                </Link>
              </li>
              <li>
                <Link to="/system/form-builder?tab=settings" className="text-primary hover:underline flex items-center">
                  <span className="mr-2">●</span>
                  Configure form settings
                </Link>
              </li>
              <li>
                <a href="https://docs.example.com/forms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  <span className="mr-2">●</span>
                  Documentation
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormSettingsTab;
