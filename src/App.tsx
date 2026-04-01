import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/ui/Sidebar';
import { Navbar } from './components/ui/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import { TransactionList } from './components/dashboard/TransactionList';
import { useFilteredTransactions } from './hooks/useFilteredTransactions';

function TransactionsPage() {
  const transactions = useFilteredTransactions();
  return (
    <div className="flex-1 space-y-6 p-1">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">All Transactions</h2>
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10 bg-[#F8F9FA] dark:bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="*" element={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Page not found (placeholder)
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
