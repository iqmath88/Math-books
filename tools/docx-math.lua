-- lesson-docx: <span class="math inline|display">TeX</span> -> native Word equation
function Span(s)
  if s.classes:includes('math') then
    local t = pandoc.utils.stringify(s.content)
    return pandoc.Math(s.classes:includes('display') and 'DisplayMath' or 'InlineMath', t)
  end
end
