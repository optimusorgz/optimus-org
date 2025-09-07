import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "Faculty Advisor",
      department: "Computer Science",
      image: "/placeholder.svg",
      bio: "Leading AI research with 15+ years of experience in machine learning and neural networks.",
      specialties: ["Artificial Intelligence", "Machine Learning", "Research"],
      social: {
        email: "sarah.chen@university.edu",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 2,
      name: "Alex Rodriguez",
      role: "Club President",
      department: "Software Engineering",
      image: "/placeholder.svg",
      bio: "Passionate about full-stack development and building innovative solutions for real-world problems.",
      specialties: ["Full-Stack Development", "Leadership", "Project Management"],
      social: {
        email: "alex.rodriguez@student.edu",
        linkedin: "#",
        github: "#",
        twitter: "#"
      }
    },
    {
      id: 3,
      name: "Maya Patel",
      role: "Vice President",
      department: "Data Science",
      image: "/placeholder.svg",
      bio: "Data enthusiast with expertise in analytics, visualization, and machine learning applications.",
      specialties: ["Data Science", "Analytics", "Visualization"],
      social: {
        email: "maya.patel@student.edu",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 4,
      name: "David Kim",
      role: "Technical Lead",
      department: "Cybersecurity",
      image: "/placeholder.svg",
      bio: "Cybersecurity expert focused on ethical hacking, penetration testing, and security research.",
      specialties: ["Cybersecurity", "Ethical Hacking", "Security Research"],
      social: {
        email: "david.kim@student.edu",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 5,
      name: "Emma Johnson",
      role: "Events Coordinator",
      department: "Computer Engineering",
      image: "/placeholder.svg",
      bio: "Organizing amazing events and workshops to foster learning and collaboration in our community.",
      specialties: ["Event Management", "Community Building", "Hardware"],
      social: {
        email: "emma.johnson@student.edu",
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      id: 6,
      name: "Ryan Thompson",
      role: "Workshop Lead",
      department: "Software Development",
      image: "/placeholder.svg",
      bio: "Creating hands-on learning experiences in web development, mobile apps, and emerging technologies.",
      specialties: ["Web Development", "Mobile Apps", "Teaching"],
      social: {
        email: "ryan.thompson@student.edu",
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 7,
      name: "Zoe Martinez",
      role: "Design Lead",
      department: "UI/UX Design",
      image: "/placeholder.svg",
      bio: "Crafting beautiful and intuitive user experiences for web and mobile applications.",
      specialties: ["UI/UX Design", "User Research", "Prototyping"],
      social: {
        email: "zoe.martinez@student.edu",
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      id: 8,
      name: "James Wilson",
      role: "Research Coordinator",
      department: "Artificial Intelligence",
      image: "/placeholder.svg",
      bio: "Coordinating research projects and collaborations between students and industry partners.",
      specialties: ["Research", "AI", "Industry Relations"],
      social: {
        email: "james.wilson@student.edu",
        linkedin: "#",
        github: "#"
      }
    }
  ];

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      "Faculty Advisor": "bg-primary/20 text-primary",
      "Club President": "bg-success/20 text-success",
      "Vice President": "bg-warning/20 text-warning",
      "Technical Lead": "bg-danger/20 text-danger",
      "Events Coordinator": "bg-primary/20 text-primary",
      "Workshop Lead": "bg-success/20 text-success",
      "Design Lead": "bg-warning/20 text-warning",
      "Research Coordinator": "bg-danger/20 text-danger"
    };
    return colors[role] || "bg-muted/20 text-muted-foreground";
  };

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 fade-up">
          <h1 className="text-4xl md:text-5xl font-bold text-glow mb-6">
            Meet Our <span className="text-primary">Team</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The passionate individuals driving innovation and excellence at Optimus Technical Club. 
            Our diverse team brings together expertise from various technical domains to create 
            an exceptional learning experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card 
              key={member.id} 
              className="card-hover group fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Role Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.department}</p>
                  <p className="text-sm text-foreground leading-relaxed">{member.bio}</p>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 justify-center mb-6">
                  {member.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted/30 text-muted-foreground"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3">
                  {member.social.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                      asChild
                    >
                      <a href={`mailto:${member.social.email}`} aria-label="Email">
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {member.social.linkedin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                      asChild
                    >
                      <a href={member.social.linkedin} aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {member.social.github && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                      asChild
                    >
                      <a href={member.social.github} aria-label="GitHub">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {member.social.twitter && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                      asChild
                    >
                      <a href={member.social.twitter} aria-label="Twitter">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 fade-up">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Want to Join Our Team?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for passionate individuals to join our mission of 
              fostering innovation and technical excellence in our community.
            </p>
            <Button className="btn-hero text-lg px-8 py-3">
              Apply to Join
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;