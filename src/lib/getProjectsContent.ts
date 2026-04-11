// lib/getProjectsContent.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { ProjectsContent } from "@/types/projects";

export async function getProjectsContent(): Promise<ProjectsContent | null> {
  try {
    const ref = doc(db, "siteContent", "projects");
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      return snap.data() as ProjectsContent;
    }
    
    return null;
  } catch (error) {
   // console.error("Error fetching projects content:", error);
    return null;
  }
}