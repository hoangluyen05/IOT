
import {
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Code,
  PenTool,
  Blocks,
} from "lucide-react";

import { profile, resources } from "../services/mockData";

const resourceIcons = {
  PDF: FileText,
  API: Blocks,
  CODE: Code,
  DESIGN: PenTool,
};

export default function Profile() {
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-heading">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="profile-avatar"
          />

          <h2>{profile.name}</h2>

          <p>Student ID: {profile.studentId}</p>

          <span className="major-badge">{profile.major}</span>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <Mail size={19} />
            <div>
              <small>EMAIL</small>
              <span>{profile.email}</span>
            </div>
          </div>

          <div className="profile-detail">
            <MapPin size={19} />
            <div>
              <small>LOCATION</small>
              <span>{profile.location}</span>
            </div>
          </div>

          <div className="profile-detail">
            <GraduationCap size={19} />
            <div>
              <small>UNIVERSITY</small>
              <span>{profile.university}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resources-section">
        <h2>Documentation & Resources</h2>

        <div className="resources-grid">
          {resources.map((item) => {
            const Icon = resourceIcons[item.type];

            const content = (
              <>
                <div className="resource-top">
                  <div className={`resource-icon ${item.type.toLowerCase()}`}>
                    <Icon size={24} />
                  </div>

                  <span className="resource-type">{item.type}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </>
            );

            return item.url ? (
              <a
                key={item.title}
                className="resource-card"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            ) : (
              <div key={item.title} className="resource-card">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
