using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ContactsController : ControllerBase
{
    private readonly ContactDbContext _context;

    public ContactsController(ContactDbContext context)
    {
        _context = context;
    }

    // GET: api/contacts/search?query=John
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Contact>>> Search(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest("Query is required");

        var results = await _context.Contacts
            .Where(c => c.Name.Contains(query) || c.PhoneNumber.Contains(query))
            .ToListAsync();

        return Ok(results);
    }
}
