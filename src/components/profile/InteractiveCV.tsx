import { useState } from "react";
import { Badge } from "./Badge";
import {
  Book,
  Briefcase,
  GraduationCap,
  Languages,
  Award,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface Education {
  school: string;
  degree: string;
  period: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface Language {
  name: string;
  level: string;
  progress: number;
}

interface Certificate {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export function InteractiveCV() {
  const [activeSection, setActiveSection] = useState<string>("skills");

  const skills: Skill[] = [
    { name: "React", level: 90, category: "Frontend" },
    { name: "Node.js", level: 85, category: "Backend" },
    { name: "TypeScript", level: 88, category: "Languages" },
    { name: "Python", level: 80, category: "Languages" },
    { name: "Docker", level: 75, category: "DevOps" },
  ];

  const education: Education[] = [
    {
      school: "Université de Yaoundé I",
      degree: "Master en Informatique",
      period: "2023 - 2025",
      description: "Spécialisation en développement web et mobile",
    },
    {
      school: "Institut Universitaire de la Côte",
      degree: "Licence en Génie Logiciel",
      period: "2020 - 2023",
      description: "Formation en développement logiciel et bases de données",
    },
  ];

  const experiences: Experience[] = [
    {
      company: "Tech Innovation Labs",
      position: "Stagiaire Développeur Full Stack",
      period: "Juin 2024 - Présent",
      description: "Développement d'applications web avec React et Node.js",
    },
    {
      company: "Digital Solutions Cameroun",
      position: "Stagiaire Frontend",
      period: "Jan 2024 - Mai 2024",
      description: "Création d'interfaces utilisateur responsive",
    },
  ];

  const languages: Language[] = [
    { name: "Français", level: "Natif", progress: 100 },
    { name: "Anglais", level: "Professionnel", progress: 85 },
    { name: "Espagnol", level: "Intermédiaire", progress: 60 },
  ];

  const certificates: Certificate[] = [
    {
      name: "React Developer Certificate",
      issuer: "Meta",
      date: "2024",
      link: "#",
    },
    {
      name: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2023",
      link: "#",
    },
  ];

  const sections = [
    { id: "skills", label: "Compétences", icon: Code },
    { id: "education", label: "Formation", icon: GraduationCap },
    { id: "experience", label: "Expérience", icon: Briefcase },
    { id: "languages", label: "Langues", icon: Languages },
    { id: "certificates", label: "Certifications", icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge type="premium" />
        <Badge type="verified" />
        <Badge type="expert" />
      </div>

      {/* Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeSection === id ? "default" : "outline"}
            onClick={() => setActiveSection(id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {activeSection === "skills" && (
          <Card>
            <CardHeader>
              <CardTitle>Compétences Techniques</CardTitle>
              <CardDescription>
                Évaluation des compétences techniques et professionnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "education" && (
          <Card>
            <CardHeader>
              <CardTitle>Formation</CardTitle>
              <CardDescription>Parcours académique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu) => (
                <div key={edu.school} className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <p className="text-muted-foreground">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                  <p className="mt-2">{edu.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "experience" && (
          <Card>
            <CardHeader>
              <CardTitle>Expérience Professionnelle</CardTitle>
              <CardDescription>Stages et projets professionnels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.company} className="border-l-2 border-primary pl-4">
                  <h3 className="font-semibold">{exp.company}</h3>
                  <p className="text-muted-foreground">{exp.position}</p>
                  <p className="text-sm text-muted-foreground">{exp.period}</p>
                  <p className="mt-2">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "languages" && (
          <Card>
            <CardHeader>
              <CardTitle>Langues</CardTitle>
              <CardDescription>Compétences linguistiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {languages.map((lang) => (
                <div key={lang.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground">{lang.level}</span>
                  </div>
                  <Progress value={lang.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === "certificates" && (
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Certifications professionnelles et formations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.name}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer} • {cert.date}
                    </p>
                    {cert.link && (
                      <a
                        href={cert.link}
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        Voir le certificat
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
