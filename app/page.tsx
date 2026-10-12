import Home from './home/page';
import SkillsPage from './skills/page';
import About from './about/page';
import ProjectsScrollReveal from './projects/page';
// import Testimonial from './testimonial/page';
import Contact from './contact/page';

export default function Main() {
  return (
    <main className="flex flex-col gap-32">
      <Home />
      <SkillsPage />
      <ProjectsScrollReveal />
      <About />
      {/* <Testimonial /> */}
      <Contact />
    </main>
  );
}
