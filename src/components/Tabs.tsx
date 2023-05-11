import Link from 'next/link';

interface TabsProps {
  tabs: any[];
  activeTab: string;
  setActiveTab: (e: any) => void;
}
const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => {
  const handleChangeTab = (e: { name: string; href?: string }) => {
    setActiveTab(e);
  };

  return (
    <div>
      <div>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) =>
            tab.href ? (
              <Link
                key={tab.name}
                href={tab.href ?? ''}
                className={`${
                  activeTab === tab.name
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-orange-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => handleChangeTab(tab)}
              >
                {tab.name}
              </Link>
            ) : (
              <p
                onClick={() => setActiveTab(tab.name)}
                className={`${
                  activeTab === tab.name
                    ? 'border-orange-500 text-orange-500 leading-0'
                    : 'border-transparent text-gray-500 hover:text-orange-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[16px]  cursor-pointer`}
                key={tab.id}
              >
                {tab.name}
              </p>
            )
          )}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
