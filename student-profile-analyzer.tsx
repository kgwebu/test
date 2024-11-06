import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Users, Target, FileSpreadsheet, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const ProfileAnalyzer = () => {
  const [studentData, setStudentData] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [selectedOutreachGroup, setSelectedOutreachGroup] = useState(null);

  // Previous file upload and parsing logic remains the same
  const parseSpreadsheetData = (data) => {
    const rows = data.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    
    return rows.slice(1).map(row => {
      const values = row.split(',');
      const student = {};
      headers.forEach((header, index) => {
        student[header] = values[index]?.trim();
      });
      return student;
    });
  };

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    setError('');
    setIsProcessing(true);

    if (file) {
      try {
        const text = await file.text();
        const parsedData = parseSpreadsheetData(text);
        setStudentData(parsedData);
        generateAudienceProfiles(parsedData);
      } catch (err) {
        setError('Error processing file. Please ensure it\'s a valid CSV/Excel file.');
      } finally {
        setIsProcessing(false);
      }
    }
  }, []);

  // Previous profile generation logic remains the same
  const generateAudienceProfiles = (data) => {
    const profileCategories = {
      highAchievers: {
        name: 'High Achievers',
        criteria: (student) => parseFloat(student.gpa) >= 3.9,
        students: [],
        characteristics: [],
        recommendedApproach: '',
        outreachTemplates: [
          {
            name: 'Merit Scholarship',
            subject: 'Exclusive Merit Scholarship Opportunity',
            template: 'Dear {name}, Based on your outstanding academic performance (GPA: {gpa}), we wanted to inform you about our merit scholarship program...'
          },
          {
            name: 'Research Opportunities',
            subject: 'Advanced Research Programs at Our University',
            template: 'Dear {name}, Given your excellent academic record and interests in {academicInterests}, we wanted to highlight our research opportunities...'
          }
        ]
      },
      internationalStudents: {
        name: 'International Prospects',
        criteria: (student) => student.country !== 'USA',
        students: [],
        characteristics: [],
        recommendedApproach: '',
        outreachTemplates: [
          {
            name: 'International Welcome',
            subject: 'Join Our Global Community',
            template: 'Dear {name}, As an international student from {country}, we want to share how our university supports international scholars...'
          },
          {
            name: 'Visa Support',
            subject: 'International Student Services Information',
            template: 'Dear {name}, We understand that studying abroad is a big decision. Our International Student Services office provides...'
          }
        ]
      },
      firstGeneration: {
        name: 'First Generation Students',
        criteria: (student) => student.firstGeneration === 'true',
        students: [],
        characteristics: [],
        recommendedApproach: '',
        outreachTemplates: [
          {
            name: 'First-Gen Support',
            subject: 'First Generation Student Programs',
            template: 'Dear {name}, As a first-generation college student, you\'ll find a supportive community here. Our First-Gen Success Program...'
          },
          {
            name: 'Financial Aid Info',
            subject: 'Financial Aid and Support Programs',
            template: 'Dear {name}, We want to ensure you have information about our comprehensive financial aid packages and support services...'
          }
        ]
      },
      highFinancialNeed: {
        name: 'High Financial Need',
        criteria: (student) => 
          student.financialAidInterest === 'High' && 
          parseInt(student.householdIncome) < 75000,
        students: [],
        characteristics: [],
        recommendedApproach: '',
        outreachTemplates: [
          {
            name: 'Aid Package',
            subject: 'Financial Aid Opportunities',
            template: 'Dear {name}, We\'re committed to making education accessible. Let me tell you about our comprehensive financial aid packages...'
          },
          {
            name: 'Work Study',
            subject: 'Work-Study and Scholarship Information',
            template: 'Dear {name}, I wanted to share information about our work-study programs and need-based scholarships...'
          }
        ]
      }
    };

    // Categorize students and generate profiles
    data.forEach(student => {
      Object.keys(profileCategories).forEach(category => {
        if (profileCategories[category].criteria(student)) {
          profileCategories[category].students.push(student);
        }
      });
    });

    Object.keys(profileCategories).forEach(category => {
      const profile = profileCategories[category];
      profile.characteristics = analyzeProfileCharacteristics(profile.students);
      profile.recommendedApproach = generateRecommendedApproach(profile);
    });

    setProfiles(Object.values(profileCategories));
  };

  // Previous analysis functions remain the same
  const analyzeProfileCharacteristics = (students) => {
    return ["Average GPA: " + (students.reduce((sum, student) => 
      sum + parseFloat(student.gpa), 0) / students.length).toFixed(2)];
  };

  const generateRecommendedApproach = (profile) => {
    return profile.name === 'High Achievers' 
      ? 'Focus on advanced programs, research opportunities, and merit scholarships'
      : 'Personalized communication based on individual interests and goals';
  };

  const generatePersonalizedMessage = (template, student) => {
    let message = template;
    Object.keys(student).forEach(key => {
      message = message.replace(`{${key}}`, student[key]);
    });
    return message;
  };

  const OutreachDialog = ({ profile, student }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Customize Outreach
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Outreach for {student.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {profile.outreachTemplates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-sm">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">Subject: {template.subject}</div>
                  <div className="text-sm whitespace-pre-wrap">
                    {generatePersonalizedMessage(template.template, student)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Profile Analysis</h1>
      
      {/* File Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Student Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              className="w-full max-w-md"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Select Spreadsheet
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Cards with Expandable Student Lists */}
      {profiles.length > 0 && (
        <div className="space-y-6">
          {profiles.map((profile, index) => (
            <Card key={index}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedProfile(expandedProfile === index ? null : index)}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {profile.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {profile.students.length} students
                    </Badge>
                    {expandedProfile === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              {expandedProfile === index && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Profile Characteristics:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {profile.characteristics.map((char, i) => (
                          <li key={i}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Student List:</h3>
                      <div className="border rounded-lg overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Name</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Email</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Location</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Interests</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {profile.students.map((student, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{student.email}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{student.country}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                                  {student.academicInterests}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  <OutreachDialog profile={profile} student={student} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileAnalyzer;
