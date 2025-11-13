import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface LeaderboardEntry {
  player_name: string;
  score: number;
  date: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Кто был первым фараоном объединённого Египта?',
    options: ['Тутанхамон', 'Нармер', 'Хеопс', 'Рамзес II'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 2,
    question: 'Какая пирамида является самой большой в Египте?',
    options: ['Пирамида Хефрена', 'Пирамида Хеопса', 'Пирамида Джосера', 'Пирамида Микерина'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 3,
    question: 'Как называлась письменность Древнего Египта?',
    options: ['Клинопись', 'Иероглифы', 'Руны', 'Алфавит'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 4,
    question: 'Какой бог был владыкой загробного мира?',
    options: ['Ра', 'Анубис', 'Осирис', 'Гор'],
    correctAnswer: 2,
    points: 15
  },
  {
    id: 5,
    question: 'Из чего делали папирус?',
    options: ['Из тростника', 'Из дерева', 'Из кожи', 'Из глины'],
    correctAnswer: 0,
    points: 10
  },
  {
    id: 6,
    question: 'Какая река была источником жизни для древних египтян?',
    options: ['Тигр', 'Евфрат', 'Нил', 'Иордан'],
    correctAnswer: 2,
    points: 5
  },
  {
    id: 7,
    question: 'Как назывался процесс сохранения тел умерших?',
    options: ['Бальзамирование', 'Мумификация', 'Консервация', 'Кремация'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 8,
    question: 'Какая женщина-фараон правила Египтом около 20 лет?',
    options: ['Нефертити', 'Клеопатра', 'Хатшепсут', 'Нефертари'],
    correctAnswer: 2,
    points: 15
  },
  {
    id: 9,
    question: 'Что охраняет Большой Сфинкс?',
    options: ['Храм Карнак', 'Пирамиды Гизы', 'Луксорский храм', 'Долину царей'],
    correctAnswer: 1,
    points: 10
  },
  {
    id: 10,
    question: 'Какой фараон знаменит своей неразграбленной гробницей?',
    options: ['Рамзес II', 'Тутанхамон', 'Эхнатон', 'Сети I'],
    correctAnswer: 1,
    points: 15
  }
];

const LEADERBOARD_API = 'https://functions.poehali.dev/62de31bb-9a34-47cb-981c-610390879665';

const Index = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'results' | 'leaderboard'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(LEADERBOARD_API);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScore = async (name: string, scoreValue: number) => {
    try {
      await fetch(LEADERBOARD_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score: scoreValue }),
      });
      await loadLeaderboard();
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const startQuiz = () => {
    if (!playerName.trim()) {
      toast({
        title: 'Введите имя',
        description: 'Пожалуйста, введите ваше имя для начала игры',
        variant: 'destructive'
      });
      return;
    }
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      const newScore = score + questions[currentQuestion].points;
      setScore(newScore);
      toast({
        title: '✅ Правильно!',
        description: `+${questions[currentQuestion].points} баллов`,
      });
    } else {
      toast({
        title: '❌ Неправильно',
        description: 'Попробуйте следующий вопрос',
        variant: 'destructive'
      });
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const finishQuiz = async () => {
    await saveScore(playerName, score);
    setGameState('results');
  };

  const showLeaderboard = () => {
    setGameState('leaderboard');
  };

  const resetQuiz = () => {
    setGameState('start');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setPlayerName('');
  };

  const getScoreMessage = () => {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return { text: 'Великий фараон! 👑', emoji: '🏆' };
    if (percentage >= 70) return { text: 'Знаток Египта! 📜', emoji: '⭐' };
    if (percentage >= 50) return { text: 'Хороший результат! 🏺', emoji: '✨' };
    return { text: 'Продолжайте учиться! 📚', emoji: '💪' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--egyptian-sand))] to-[hsl(var(--egyptian-blue))] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {gameState === 'start' && (
          <Card className="animate-fade-in border-4 border-primary/30 shadow-2xl bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="flex justify-center mb-4">
                <div className="text-8xl">🏛️</div>
              </div>
              <CardTitle className="text-5xl md:text-6xl font-cinzel font-bold text-primary mb-4">
                Квиз: Древний Египет
              </CardTitle>
              <CardDescription className="text-xl font-cormorant text-foreground/80">
                Проверьте свои знания о величайшей цивилизации древности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="text-3xl mb-2">❓</div>
                    <div className="font-cinzel font-semibold">10 вопросов</div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="font-cinzel font-semibold">До 110 баллов</div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="font-cinzel font-semibold">Лидерборд</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <label className="text-sm font-cinzel font-semibold text-foreground">
                  Ваше имя:
                </label>
                <Input
                  type="text"
                  placeholder="Введите имя..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="text-lg font-cormorant border-2 border-primary/30 focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button 
                  onClick={startQuiz} 
                  size="lg" 
                  className="w-full text-lg font-cinzel bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <Icon name="Play" className="mr-2" size={20} />
                  Начать квиз
                </Button>
                <Button 
                  onClick={showLeaderboard} 
                  size="lg" 
                  variant="outline"
                  className="w-full text-lg font-cinzel border-2 border-primary/50 hover:bg-primary/10"
                >
                  <Icon name="Trophy" className="mr-2" size={20} />
                  Лидерборд
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-4 border-primary/30 shadow-2xl bg-card/95 backdrop-blur">
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2 font-cinzel">
                    Вопрос {currentQuestion + 1} / {questions.length}
                  </Badge>
                  <Badge className="text-lg px-4 py-2 font-cinzel bg-primary text-primary-foreground">
                    <Icon name="Star" size={16} className="mr-1" />
                    {score} баллов
                  </Badge>
                </div>
                <Progress 
                  value={((currentQuestion + 1) / questions.length) * 100} 
                  className="h-3 bg-secondary"
                />
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                <CardTitle className="text-2xl md:text-3xl font-cormorant font-semibold leading-relaxed">
                  {questions[currentQuestion].question}
                </CardTitle>
                
                <div className="grid gap-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestion].correctAnswer;
                    const showResult = selectedAnswer !== null;
                    
                    let buttonClass = 'border-2 border-primary/30 hover:border-primary hover:bg-primary/5';
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass = 'border-green-500 bg-green-50 text-green-900 border-2';
                      } else if (isSelected) {
                        buttonClass = 'border-red-500 bg-red-50 text-red-900 border-2';
                      }
                    }
                    
                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        variant="outline"
                        className={`w-full text-left text-base md:text-lg py-6 font-cormorant justify-start transition-all ${buttonClass}`}
                      >
                        <span className="mr-3 font-cinzel font-bold">{String.fromCharCode(65 + index)}.</span>
                        {option}
                        {showResult && isCorrect && <Icon name="Check" className="ml-auto text-green-600" size={24} />}
                        {showResult && isSelected && !isCorrect && <Icon name="X" className="ml-auto text-red-600" size={24} />}
                      </Button>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-center pt-4 text-sm text-muted-foreground font-cormorant">
                  <Icon name="Award" size={16} className="mr-2" />
                  За этот вопрос: {questions[currentQuestion].points} баллов
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'results' && (
          <Card className="animate-scale-in border-4 border-primary/30 shadow-2xl bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-6 pb-6">
              <div className="text-8xl">{getScoreMessage().emoji}</div>
              <CardTitle className="text-4xl md:text-5xl font-cinzel font-bold text-primary">
                {getScoreMessage().text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8">
              <div className="text-center space-y-4">
                <div className="text-6xl font-cinzel font-bold text-primary">{score}</div>
                <div className="text-xl font-cormorant text-muted-foreground">
                  из {questions.reduce((sum, q) => sum + q.points, 0)} возможных баллов
                </div>
                <Progress 
                  value={(score / questions.reduce((sum, q) => sum + q.points, 0)) * 100} 
                  className="h-4"
                />
              </div>

              <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
                <div className="text-center space-y-2">
                  <div className="text-sm font-cinzel text-muted-foreground">Игрок</div>
                  <div className="text-2xl font-cinzel font-bold">{playerName}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={resetQuiz} 
                  size="lg"
                  variant="outline"
                  className="w-full text-lg font-cinzel border-2 border-primary/50 hover:bg-primary/10"
                >
                  <Icon name="RotateCcw" className="mr-2" size={20} />
                  Пройти снова
                </Button>
                <Button 
                  onClick={showLeaderboard} 
                  size="lg"
                  className="w-full text-lg font-cinzel bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Icon name="Trophy" className="mr-2" size={20} />
                  Лидерборд
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === 'leaderboard' && (
          <Card className="animate-fade-in border-4 border-primary/30 shadow-2xl bg-card/95 backdrop-blur">
            <CardHeader className="text-center space-y-4">
              <div className="text-6xl">🏆</div>
              <CardTitle className="text-4xl md:text-5xl font-cinzel font-bold text-primary">
                Таблица лидеров
              </CardTitle>
              <CardDescription className="text-lg font-cormorant">
                Лучшие знатоки Древнего Египта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-8">
              {loading ? (
                <div className="text-center py-8 font-cormorant text-muted-foreground">
                  Загрузка...
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        entry.player_name === playerName && entry.score === score
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-primary/20 bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-cinzel font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-600' :
                          'text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-cinzel font-semibold text-lg">{entry.player_name}</div>
                          <div className="text-sm text-muted-foreground font-cormorant">{entry.date}</div>
                        </div>
                      </div>
                      <Badge className="text-lg px-4 py-2 font-cinzel bg-primary text-primary-foreground">
                        {entry.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={resetQuiz} 
                size="lg"
                className="w-full mt-6 text-lg font-cinzel bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Icon name="Home" className="mr-2" size={20} />
                На главную
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;