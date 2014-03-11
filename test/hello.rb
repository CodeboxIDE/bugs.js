location = {
  :home => "france",
  :work => "california",
  :addr => {
    :town => "Palo Alto",
    :street => "Something"
  }
}

class Person
    def initialize(name, age)
        @age = age
        @name = name
    end

    def hello
        puts "Hello my name is #{@name}"
    end
end

name = 'aaron'
age = 20
aaron = Person.new(name, age)

def f(y, z)
  y * z * 3
end

f(88, 2)

if f(3, 1) < 4
  puts "good"
else
  puts "bad"
end

aaron.hello()
