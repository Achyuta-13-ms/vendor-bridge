const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) filelist.push(dirFile);
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/app/dashboard'));

// Add onboarding
files.push(path.join(__dirname, 'src/app/onboarding/page.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Check if vendorSession logic exists
  if (content.includes('localStorage.getItem("vendorSession")') || content.includes("localStorage.getItem('vendorSession')")) {
    
    // Ensure useAuth is imported
    if (!content.includes('useAuth')) {
       // Insert import
       const importRegex = /import.*?['"](?:react|next\/navigation)['"];?/g;
       const match = [...content.matchAll(importRegex)].pop();
       if (match) {
         content = content.slice(0, match.index + match[0].length) + '\nimport { useAuth } from "@/hooks/useAuth";' + content.slice(match.index + match[0].length);
       } else {
         content = 'import { useAuth } from "@/hooks/useAuth";\n' + content;
       }
    }

    // Identify component name to inject hook if not exists
    const useAuthHook = `const { user } = useAuth();`;
    
    // Replace the specific initialization patterns
    content = content.replace(/const \[vendorSession, setVendorSession\] = useState.*?;\n/g, '');
    
    content = content.replace(/const raw = localStorage\.getItem\(["']vendorSession["']\);\s*if \(!raw\) {\s*.*?return;\s*}\s*const session = JSON\.parse\(raw\);\s*setVendorSession\(session\);/gs, `if (!user) return;\n      setVendorSession({ id: user.id, email: user.email });`);
    
    // For direct fetching without setVendorSession
    content = content.replace(/const raw = localStorage\.getItem\(["']vendorSession["']\);\s*if \(!raw\) {\s*.*?return;\s*}\s*const session = JSON\.parse\(raw\);/gs, `if (!user) return;\n    const session = { id: user.id, email: user.email };`);

    // Ensure { user } = useAuth() is injected early in component
    // If not injected:
    if (!content.includes(useAuthHook) && !content.includes('const { user, loading } = useAuth()')) {
        content = content.replace(/export default function \w+\([^)]*\) {\n/, (match) => `${match}  ${useAuthHook}\n`);
    }

    // For any useEffect missing `user` in deps array when session logic was there
    content = content.replace(/}, \[.*?\]\);/g, (match) => {
        if (!match.includes('user') && match.includes('router')) {
            return match.replace(/\]\);/, ', user]);');
        }
        return match;
    });

    fs.writeFileSync(file, content);
    console.log("Fixed:", file);
  }
});
