import Switch from "@/components/ui/toggle-switch";

export default function ThemeToggleDemo() {
  return (
    <div className="flex items-center justify-center min-h-[200px] bg-background text-foreground">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Dark/Light Mode Toggle</h2>
        <p className="text-muted-foreground">Toggle between dark and light themes</p>
        <Switch />
      </div>
    </div>
  );
}