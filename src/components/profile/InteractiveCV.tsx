
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  CheckCircle2,
} from "lucide-react";

interface InteractiveCVProps {
  cvUrl?: string;
}

export function InteractiveCV({ cvUrl }: InteractiveCVProps) {
  const [activeSection, setActiveSection] = useState("experience");

  // Données fictives pour la démonstration
  const cvData = {
    experience: [
      {
        id: "exp1",
        role: "Stagiaire Développeur Front-end",
        company: "Tech Solutions Inc.",
        location: "Paris, France",
        period: "Juin 2022 - Août 2022",
        description:
          "Développement d'interfaces utilisateur réactives avec React et TypeScript. Collaboration avec l'équipe de conception pour implémenter de nouvelles fonctionnalités.",
        skills: ["React", "TypeScript", "UI/UX", "Git"],
      },
      {
        id: "exp2",
        role: "Assistant de Recherche",
        company: "Université Paris-Saclay",
        location: "Saclay, France",
        period: "Janvier 2022 - Mai 2022",
        description:
          "Participation à un projet de recherche sur l'intelligence artificielle appliquée à l'analyse d'images médicales. Implémentation d'algorithmes de traitement d'image.",
        skills: ["Python", "Machine Learning", "OpenCV", "Collaboration de recherche"],
      },
    ],
    education: [
      {
        id: "edu1",
        degree: "Master en Informatique",
        institution: "Université Paris-Saclay",
        location: "Saclay, France",
        period: "2021 - 2023",
        description:
          "Spécialisation en développement logiciel et intelligence artificielle. Projet de fin d'études sur l'optimisation des interfaces utilisateur pour applications mobiles.",
        courses: ["Algorithmique avancée", "Deep Learning", "Développement Web", "Projet de conception"],
      },
      {
        id: "edu2",
        degree: "Licence en Informatique",
        institution: "Université de Lille",
        location: "Lille, France",
        period: "2018 - 2021",
        description:
          "Formation générale en informatique avec une introduction aux différents domaines du secteur.",
        courses: ["Programmation orientée objet", "Bases de données", "Structures de données", "Réseaux"],
      },
    ],
    skills: [
      { name: "JavaScript", level: 9 },
      { name: "TypeScript", level: 8 },
      { name: "React", level: 8 },
      { name: "HTML/CSS", level: 9 },
      { name: "Node.js", level: 7 },
      { name: "Python", level: 7 },
      { name: "SQL", level: 6 },
      { name: "Git", level: 8 },
    ],
    languages: [
      { name: "Français", level: "Natif" },
      { name: "Anglais", level: "Professionnel (C1)" },
      { name: "Espagnol", level: "Intermédiaire (B1)" },
    ],
    certifications: [
      {
        id: "cert1",
        name: "Meta Front-End Developer Professional Certificate",
        issuer: "Coursera",
        date: "2022",
        description: "Programme complet couvrant React, JavaScript, et le développement d'interfaces utilisateur modernes.",
      },
      {
        id: "cert2",
        name: "AWS Certified Developer - Associate",
        issuer: "Amazon Web Services",
        date: "2023",
        description: "Certification validant les compétences en développement et déploiement d'applications sur AWS.",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Curriculum Vitae</h3>
        {cvUrl && (
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4" /> Télécharger le CV
            </a>
          </Button>
        )}
      </div>

      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="experience">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Expérience</span>
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Éducation</span>
          </TabsTrigger>
          <TabsTrigger value="skills">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Compétences</span>
          </TabsTrigger>
          <TabsTrigger value="languages">
            <Languages className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Langues</span>
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Certifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience" className="space-y-4 mt-4">
          {cvData.experience.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-lg">{exp.role}</h4>
                    <p className="text-muted-foreground">
                      {exp.company} • {exp.location}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exp.period}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {exp.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {exp.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="education" className="space-y-4 mt-4">
          {cvData.education.map((edu) => (
            <Card key={edu.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-lg">{edu.degree}</h4>
                    <p className="text-muted-foreground">
                      {edu.institution} • {edu.location}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {edu.period}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {edu.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-sm mb-2">Cours principaux:</h5>
                  <div className="flex flex-wrap gap-2">
                    {edu.courses.map((course) => (
                      <Badge key={course} variant="outline">
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cvData.skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">
                        {skill.level}/10
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(skill.level / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cvData.languages.map((language) => (
                  <div key={language.name} className="flex items-center justify-between">
                    <span className="font-medium">{language.name}</span>
                    <Badge>{language.level}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4 mt-4">
          {cvData.certifications.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="p-6">
                <div>
                  <h4 className="font-semibold text-lg">{cert.name}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{cert.issuer}</span>
                    <span>•</span>
                    <span>{cert.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cert.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
