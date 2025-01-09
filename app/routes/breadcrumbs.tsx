// Breadcrumbs component
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

export default function Breadcrumbs({ paths }: { paths: Array<{ label: string; url: string }> }) {
  if (typeof window === 'undefined') {
    return null; // Return null if window is not defined
  }
  const currentPath = window.location.pathname; // Get the current path from the browser

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {paths.map((path, index) => (
          <li key={index}>
            <div className="flex items-center"> {/* Add a wrapper div */}
              <a
                href={path.url}
                className={`text-blue-900 hover:text-blue-900 ${currentPath === path.url ? 'font-bold' : ''}`}
                style={{ color: currentPath === path.url ? '#3F72AF' : 'inherit' }}
              >
                {path.label}
              </a>
              {index < paths.length - 1 && ( // Add ChevronRightIcon conditionally for all except the last path
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
